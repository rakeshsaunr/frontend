import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Detailsprod() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(` https://navdana-backend-2.onrender.com/api/v1/product/${id}`);
        console.log("RESPONSE IS:",res)
        if (res.data.success) {
          setProduct(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-lg text-gray-600">₹{product.price}</p>

      {/* Show all images */}
      <div className="flex gap-4 mt-4">
        {product.images.map((img, index) => (
          <img
            key={index}
            src={img.url}
            alt={img.alt || product.name}
            className="w-40 h-40 object-cover rounded"
          />
        ))}
      </div>
    </div>
  );
}
