import { Helmet } from "react-helmet-async";

export function MetaTitle({ title }: { title: string }) {
  return (
    <Helmet>
      <title>{title} | ERM System</title>
    </Helmet>
  );
}
