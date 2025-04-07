import Card from "./Card";
type data = {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  url: string;
};
import { resources } from "../utils/links";
const Features = () => {
  const data = resources as data[];
  return (
    <div className="mt-28">
      <h1 className="capitalize text-3xl text-base-content">our Features</h1>
      <div className="grid grid-cols md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 w-full ">
        {data.map((item) => {
          return <Card key={item.id} {...item} />;
        })}
      </div>
    </div>
  );
};

export default Features;
