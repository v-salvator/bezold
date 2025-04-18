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
    <footer className="bg-black text-white py-8 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center md:justify-start gap-2">
        {/* Logo */}
        <div className="mb-4 md:mb-0">
          <Image
            src="/bezold-removebg-rect.png"
            alt="bezold logo"
            width={150}
            height={40}
            className="h-auto"
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-wrap justify-start gap-6 mb-4 md:mb-0 md:pl-32">
          <Link href="/sell" className="hover:text-gray-300">
            刊登
          </Link>
          <Link href="/store-list?category=all" className="hover:text-gray-300">
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
    </footer>
  );
};

export default Footer;
