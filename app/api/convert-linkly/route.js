export const runtime = "nodejs";
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import * as cheerio from "cheerio";
import PizZip from "pizzip";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { Readable } from "stream";
import { writeFile, unlink } from "fs/promises";

const linklyApiKey = "zgLEa3iGvRZ3FijEqt3mmg==";
const domain = "link.presidentialsummary.com";

function getShort(text) {
  if (text.includes(" ")) {
    return text
      .split(/\s+/)
      .map((word) => word[0].toLowerCase())
      .join("");
  }
  return text.toLowerCase();
}

function sanitizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function createLinklyLink({ name, domain, slug, url }) {
  const res = await fetch("https://app.linklyhq.com/api/v1/link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: linklyApiKey,
      name,
      domain,
      slug,
      url,
      workspace_id: 252988,
    }),
  });

  const data = await res.json();
  if (res.ok && data.full_url) {
    return data.full_url;
  } else {
    console.error("Linkly error:", data);
    return url; // fallback
  }
}

export async function POST(req) {
  const formData = await req.formData();

  const prefix = formData.get("prefix");
  const file = formData.get("file");
  console.log("prefix", prefix);

  if (
    !prefix ||
    !file ||
    file.type !==
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log("✅ Received file, size:", buffer.length);
  const result = await mammoth.convertToHtml({ buffer });
  const $ = cheerio.load(result.value);

  let currentH2 = "",
    hCounter = 0,
    linkCounter = 0;
  let currentH4 = "",
    paraCount = 0,
    innerLinkCount = 0,
    previousWasImageOnly = false;
  const linkMap = [];

  for (const element of $("body").children().toArray()) {
    const tag = element.tagName;
    const $el = $(element);
    const text = $el.text().trim();

    if (tag === "h2") {
      currentH2 = text;
      hCounter = 0;
      currentH4 = "";
      paraCount = 0;
      innerLinkCount = 0;
      previousWasImageOnly = false;
    }

    if (tag === "h3") {
      hCounter++;
      previousWasImageOnly = false;
    }

    if (tag === "h4") {
      currentH4 = text;
      innerLinkCount = 0;
      previousWasImageOnly = false;
    }

    if (tag === "p") {
      const containsOnlyImage =
        $el.children().length === 1 && $el.find("img").length === 1;

      if (currentH4 && !containsOnlyImage && !previousWasImageOnly) {
        paraCount++;
        innerLinkCount = 0;
      }

      previousWasImageOnly = containsOnlyImage;

      const links = $el.find("a");
      if (links.length > 0) {
        for (const link of links.toArray()) {
          linkCounter++;
          innerLinkCount++;

          const href = $(link).attr("href");
          const linkedText = $(link).text().trim();
          const h2Short = getShort(currentH2);
          const hPart = hCounter > 0 ? `-h${hCounter}` : "";
          const h4Part = currentH4
            ? `-${getShort(currentH4)}-br${paraCount}-${innerLinkCount}`
            : "";
          const linkWord = sanitizeText(linkedText);
          const name = `${prefix}-${h2Short}${hPart}${h4Part}-${linkCounter}-${linkWord}`;
          const slug = name.toLowerCase().replace(/\s+/g, "-");

          linkMap.push({ href, name, slug });
        }
      }
    }
  }

  const zip = new PizZip(buffer);
  const relsXml = zip.file("word/_rels/document.xml.rels").asText();
  const relsDom = new DOMParser().parseFromString(relsXml, "text/xml");
  const relationships = Array.from(
    relsDom.getElementsByTagName("Relationship")
  ).filter((rel) => rel.getAttribute("Type")?.includes("hyperlink"));

  for (let i = 0; i < relationships.length && i < linkMap.length; i++) {
    const rel = relationships[i];
    const { name, slug, href } = linkMap[i];
    const fullUrl = await createLinklyLink({ name, domain, slug, url: href });
    if (fullUrl) {
      rel.setAttribute("Target", fullUrl);
      rel.setAttribute("TargetMode", "External");
    }
  }

  zip.file(
    "word/_rels/document.xml.rels",
    new XMLSerializer().serializeToString(relsDom)
  );
  const updatedBuffer = zip.generate({ type: "nodebuffer" });

  return new NextResponse(updatedBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="updated.docx"`,
    },
  });
}
