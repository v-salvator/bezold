import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import FeaturedSnippet from "./FeaturedSnippet";
import prose from "./prose.module.css";

/**
 * Components available inside article MDX bodies. Standard elements are styled
 * via the `.prose` wrapper in prose.module.css; only inline blocks and the
 * scroll-wrapped table are mapped here.
 *
 * NOTE: next-mdx-remote (RSC) drops JSX *expression* attributes (e.g.
 * `items={[...]}`), so components that need structured data (FAQ, related
 * links) are authored in frontmatter and rendered by the page template
 * instead of inline here. Only string-attribute / children-based components
 * belong in this map.
 */
export const mdxComponents: MDXRemoteProps["components"] = {
  FeaturedSnippet,
  table: (props) => (
    <div className={prose.tableWrap}>
      <table {...props} />
    </div>
  ),
};
