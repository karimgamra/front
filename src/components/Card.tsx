type CardProps = {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  url: string;
};

const Card = ({ title, description, image, url }: CardProps) => {
  return (
    <div className="card bg-base-200 w-full shadow-xl p-2 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-2xl hover:duration-300">
      <figure className="">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
          onError={(e) =>
            (e.currentTarget.src = "https://placehold.co/400x300")
          }
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">
            <a href={url} target="_blank">
              join now
            </a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
