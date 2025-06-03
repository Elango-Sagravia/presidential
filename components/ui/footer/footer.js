import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="hidden lg:block px-4 md:px-16 py-8 bg-black text-white ">
        <div className="flex justify-between ">
          <div className="flex flex-col justify-between">
            <Link href="/">
              <div className="w-32 md:w-44">
                <img src="/logo-dark.png" layout="responsive" alt="Logo" />
              </div>
            </Link>
            <div className="flex flex-col">
              <ul className="flex mt-8">
                <li className="underline hover:underline underline-offset-8 text-[12px] text-gray-400">
                  <Link href="/policy/privacy-policy">Privacy policy</Link>
                </li>
                <li className="underline hover:underline underline-offset-8 text-[12px] text-gray-400 ml-4">
                  <Link href="/policy/terms-of-use">Terms of use</Link>
                </li>
                <li className="underline hover:underline underline-offset-8 text-[12px] text-gray-400 ml-4">
                  <Link href="/policy/cookie-policy">Cookie policy</Link>
                </li>
                <li className="underline hover:underline underline-offset-8 text-[12px] text-gray-400 ml-4">
                  <Link href="/policy/refund-policy">Refund policy</Link>
                </li>
              </ul>
              <p className="mt-8 text-[12px] text-gray-400">
                This newsletter and website are operated by Sagravia LLC, 30 N
                Gould St, Sheridan, WY 82801.
              </p>
              <p className="mt-8 text-[12px] text-gray-400">
                © 2024 Sagravia LLC. All rights reserved.
              </p>
            </div>
          </div>
          <div>
            <ul className="ml-60">
              <li className="px-8 py-2 hover:underline underline-offset-8">
                <Link
                  target="_blank"
                  href="https://www.facebook.com/people/Presidential-Summary/61562652791256/"
                >
                  Facebook
                </Link>
              </li>
              <li className="px-8 py-2 hover:underline underline-offset-8">
                <Link
                  target="_blank"
                  href="https://www.instagram.com/presidentialsummary/"
                >
                  Instagram
                </Link>
              </li>
              <li className="px-8 py-2 hover:underline underline-offset-8">
                <Link
                  target="_blank"
                  href="https://x.com/i/flow/login?redirect_after_login=%2Fpresidentialsum"
                >
                  X
                </Link>
              </li>
              <li className="px-8 py-2 hover:underline underline-offset-8">
                <Link
                  target="_blank"
                  href="https://www.threads.net/@presidentialsummary"
                >
                  Threads
                </Link>
              </li>
              <li className="px-8 py-2 hover:underline underline-offset-8">
                <Link
                  target="_blank"
                  href="https://www.linkedin.com/showcase/presidentialsummary/"
                >
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <ul>
              <li className="px-8 py-2 hover:underline underline-offset-8">
                <Link href="/advertise">Advertise</Link>
              </li>
              <li className="px-8 py-2 hover:underline underline-offset-8">
                <Link href="/archives">Archives</Link>
              </li>
              <li className="px-8 py-2 hover:underline underline-offset-8">
                <Link href="/articles">Articles</Link>
              </li>
              <li className="px-8 py-2 hover:underline underline-offset-8">
                <Link href="/contact">Contact us</Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* mobile footer */}

      <footer className="block lg:hidden px-4 md:px-16 py-8 bg-black text-white ">
        <div className="justify-between">
          <div className="flex flex-col justify-between">
            <Link href="/">
              <div className="w-32 md:w-44">
                <img src="/logo-dark.png" layout="responsive" alt="Logo" />
              </div>
            </Link>
          </div>

          <div className="flex">
            <div className="mt-8">
              <ul>
                <li className="py-2 hover:underline underline-offset-8">
                  <Link
                    target="_blank"
                    href="https://www.facebook.com/people/Presidential-Summary/61562652791256/"
                  >
                    Facebook
                  </Link>
                </li>
                <li className="py-2 hover:underline underline-offset-8">
                  <Link
                    target="_blank"
                    href="https://www.instagram.com/presidentialsummary/"
                  >
                    Instagram
                  </Link>
                </li>
                <li className="py-2 hover:underline underline-offset-8">
                  <Link
                    target="_blank"
                    href="https://x.com/i/flow/login?redirect_after_login=%2Fpresidentialsum"
                  >
                    X
                  </Link>
                </li>
                <li className="py-2 hover:underline underline-offset-8">
                  <Link
                    target="_blank"
                    href="https://www.threads.net/@presidentialsummary"
                  >
                    Threads
                  </Link>
                </li>
                <li className="py-2 hover:underline underline-offset-8">
                  <Link
                    target="_blank"
                    href="https://www.linkedin.com/showcase/presidentialsummary/"
                  >
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </div>
            <div className="mt-8 ml-10">
              <ul>
                <li className="py-2 hover:underline underline-offset-8">
                  <Link href="/advertise">Advertise</Link>
                </li>
                <li className="py-2 hover:underline underline-offset-8">
                  <Link href="/archives">Archives</Link>
                </li>
                <li className="py-2 hover:underline underline-offset-8">
                  <Link href="/contact">Contact us</Link>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <ul className="flex mt-8">
              <li className="underline hover:underline underline-offset-8 text-[12px] text-gray-400">
                <Link href="/policy/privacy-policy">Privacy policy</Link>
              </li>
              <li className="underline hover:underline underline-offset-8 text-[12px] text-gray-400 ml-4">
                <Link href="/policy/terms-of-use">Terms of use</Link>
              </li>
              <li className="underline hover:underline underline-offset-8 text-[12px] text-gray-400 ml-4">
                <Link href="/policy/cookie-policy">Cookie policy</Link>
              </li>
              <li className="underline hover:underline underline-offset-8 text-[12px] text-gray-400 ml-4">
                <Link href="/policy/refund-policy">Refund policy</Link>
              </li>
            </ul>
          </div>
          <p className="mt-8 text-[12px] text-gray-400">
            This newsletter and website are operated by Sagravia LLC, 30 N Gould
            St, Sheridan, WY 82801
          </p>
          <p className="mt-8 text-[12px] text-gray-400">
            © 2024 Sagravia LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
