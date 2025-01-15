"use client";

import { useAppContext } from "@/context/appContext";
import BlogBannerImage from "../blogBannerImage/blogBannerImage";
import BlogInfo from "../blogInfo/blogInfo";
import BlogTitle from "../blogTitle/blogTitle";
import "./styles.css";
import HTMLContent from "./myComponent";
import content from "@/content/content";
import SubscriberForm from "../subscriberForm/subscriberForm";
import RelatedArticles from "../relatedArticles/relatedArticles";
import garamond from "@/components/garamond";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const SingleBlog = ({ blog, relatedArticles, index }) => {
  const { isSubscribed, setEmail } = useAppContext();

  const searchParams = useSearchParams();
  const rawEmail = searchParams.get("email");
  const email = rawEmail
    ? decodeURIComponent(rawEmail.toLowerCase().trim())
    : null;
  useEffect(() => {
    if (email) {
      console.log("Filtered email:", email);
      setEmail(email);
      // You can now use the email in your component or for logic
    }
  }, []);

  if (!isSubscribed && blog.emailHtml) {
    return (
      <div className="bg-[#f0f1f3] pt-5">
        <div className="bg-nl_background w-[600px] mx-auto">
          <h1
            className={`text-2xl py-5 px-5 text-center text-white`}
            style={{ fontFamily: "Roboto" }}
          >
            {blog.title}
          </h1>
        </div>
        <div className="bg-[#f0f1f3]">
          <div
            className="archive"
            dangerouslySetInnerHTML={{
              __html: blog.emailHtmlPreview.replaceAll(
                "<a",
                `<a target="_blank"`
              ),
            }}
          />
          <div className="max-w-[600px] mx-auto bg-white py-16">
            <SubscriberForm formClasses="md:w-4/5 flex flex-col gap-2 md:mx-auto bg-white px-4 md:px-0" />
          </div>
        </div>
      </div>
    );
  } else if (isSubscribed && blog.emailHtml) {
    return (
      <div className="bg-[#f0f1f3] pt-5">
        <div className="bg-nl_background w-[600px] mx-auto">
          <h1
            className={`text-2xl py-5 px-5 text-center text-white`}
            style={{ fontFamily: "Roboto" }}
          >
            {blog.title}
          </h1>
        </div>
        <div className="bg-[#f0f1f3]">
          <div
            className="archive"
            dangerouslySetInnerHTML={{
              __html: blog.emailHtml.replaceAll("<a", `<a target="_blank"`),
            }}
          />
        </div>
      </div>
    );
  }
  return (
    <>
      <section
        className={`w-full md:w-4/5 lg:w-2/3 px-4 md:px-0 mx-auto pt-16 pb-16 md:pt-32 max-w-7xl ${
          isSubscribed && "md:pb-32"
        }`}
      >
        <BlogInfo date={blog.publishedAt} read_time={blog.readTime} />
        <BlogTitle title={blog.title} />
        {/* <BlogBannerImage url={blog.coverImage} /> */}
        <div className="mt-10">
          <HTMLContent
            contentString={blog.content}
            blogCutOff={
              index <= -1
                ? blog.content.length
                : !isSubscribed
                ? blog.cutOff
                : blog.content.length
            }
            enableCutOff={index <= -1 ? false : true}
          />
          {index <= -1
            ? blog?.footerBannerContent?.length > 0 && (
                <div className="p-4 md:p-10 bg-nl_background text-white mt-6">
                  <p className="text-center text-[12px]">
                    {blog.footerBannerTitle}
                  </p>
                  <p className={`text-xl ${garamond.className} text-center`}>
                    {blog.footerBannerContent}
                  </p>
                </div>
              )
            : isSubscribed &&
              blog?.footerBannerContent?.length > 0 && (
                <div className="p-4 md:p-10 bg-nl_background text-white mt-6">
                  <p className="text-center text-[12px]">
                    {blog.footerBannerTitle}
                  </p>
                  <p className={`text-xl ${garamond.className} text-center`}>
                    {blog.footerBannerContent}
                  </p>
                </div>
              )}
        </div>
        {/* {isSubscribed ||
          (index <= -1 && relatedArticles.length > 0 && (
            <RelatedArticles articles={relatedArticles} />
          ))} */}
        {isSubscribed && relatedArticles.length > 0 && (
          <RelatedArticles articles={relatedArticles} />
        )}
      </section>
      {!isSubscribed && (
        <section className="bg-gradient-to-t	from-nl_sec_background to-white px-8 pt-4 pb-16 md:py-16 md:px-16 md:pb-32">
          <div className="w-full md:w-4/5 lg:w-3/5 mx-auto">
            <h3 className="text-4xl text-nl_background md:text-center">
              {content.archivePage.formSection.heading}
            </h3>
            <p className="text-sm mt-4 md:text-center md:w-4/5 md:mx-auto">
              {content.archivePage.formSection.description}
            </p>
            <SubscriberForm formClasses="w-full md:w-3/4 lg:w-3/5 flex flex-col gap-2 mt-8 md:mx-auto" />
            {/* <form className="w-5/6 md:w-3/4 lg:w-3/5 flex flex-col mt-8 md:mx-auto">
              <div className="flex gap-2 justify-center">
                <Input
                  type="email"
                  className="focus:outline-none focus-visible:ring-0 placeholder:text-gray-400 rounded-none"
                  placeholder="Enter email"
                />
                <Button className="rounded-none" type="submit">
                  Join Free
                </Button>
              </div>
              <span className="text-[12px] mt-4">
                100% free. No spam. Unsubscribe anytime
              </span>
            </form> */}
          </div>
        </section>
      )}
    </>
  );
};

export default SingleBlog;
