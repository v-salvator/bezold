import Link from "next/link";
import Image from "next/image";
import {
  TwitterCircleFilled,
  YoutubeFilled,
  FacebookFilled,
  LinkedinFilled,
} from "@ant-design/icons";
import LineIcon from "./icon/LineIcon";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 px-6">
      <div className="container mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl mb-4">Reach out to us</h3>
            <a
              href="mailto:inquiries@quietlight.com"
              className="block mb-2 hover:text-gray-300"
            >
              inquiries@quietlight.com
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-600 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Logo */}
            <div className="mb-6 md:mb-0">
              <Image
                src="/bezold-removebg-rect.png"
                alt="bezold logo"
                width={150}
                height={40}
                className="h-auto"
              />
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
              <Link href="/sell" className="hover:text-gray-300">
                刊登
              </Link>
              <Link
                href="/store-list?category=all"
                className="hover:text-gray-300"
              >
                購買
              </Link>
              <Link href="/learn" className="hover:text-gray-300">
                創業知識
              </Link>
              <Link href="/about" className="hover:text-gray-300">
                關於我們
              </Link>
              {/* <Link href="/success-stories" className="hover:text-gray-300">
                成功故事
              </Link> */}
            </nav>

            {/* Social Media Icons */}
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-300" aria-label="Twitter">
                <TwitterCircleFilled className="text-2xl" />
              </a>
              <a href="#" className="hover:text-gray-300" aria-label="YouTube">
                <YoutubeFilled className="text-2xl" />
              </a>
              <a href="#" className="hover:text-gray-300" aria-label="Line">
                <LineIcon className="text-2xl" />
              </a>
              <a href="#" className="hover:text-gray-300" aria-label="Facebook">
                <FacebookFilled className="text-2xl" />
              </a>
              <a href="#" className="hover:text-gray-300" aria-label="LinkedIn">
                <LinkedinFilled className="text-2xl" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
