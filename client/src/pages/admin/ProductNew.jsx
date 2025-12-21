// import { useEffect, useState } from "react";
// import AdminLayout from "@/components/admin/AdminLayout";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { productsAPI, categoriesAPI } from "@/lib/api";
// import { useNavigate, useParams } from "react-router-dom";
// import { useToast } from "@/hooks/use-toast";

// export default function ProductForm() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const [name, setName] = useState("");
//   const [price, setPrice] = useState("");
//   const [stock, setStock] = useState("");
//   const [category, setCategory] = useState("");
//   const [description, setDescription] = useState("");
//   const [categories, setCategories] = useState([]);

//   // 🔥 IMAGE STATES
//   const [images, setImages] = useState([]);       // existing images (URLs)
//   const [newImages, setNewImages] = useState([]); // newly added files

//   const [loading, setLoading] = useState(false);

//   // 🔄 LOAD DATA
//   useEffect(() => {
//     const loadData = async () => {
//       const catRes = await categoriesAPI.getAll();
//       setCategories(catRes.categories || []);

//       if (id) {
//         const res = await productsAPI.getById(id);
//         const p = res.product || res;

//         setName(p.name);
//         setPrice(p.price);
//         setStock(p.stock);
//         setCategory(p.category?._id || p.category);
//         setDescription(p.description);
//         setImages(p.images || []); // 👈 existing images
//       }
//     };
//     loadData();
//   }, [id]);

//   // 📤 SUBMIT
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("price", price);
//       formData.append("stock", stock);
//       formData.append("category", category);
//       formData.append("description", description);

//       // keep existing images
//       images.forEach((img) => {
//         formData.append("existingImages", img);
//       });

//       // new images
//       newImages.forEach((file) => {
//         formData.append("images", file);
//       });

//       if (id) {
//         await productsAPI.update(id, formData);
//         toast({ title: "Product updated" });
//       } else {
//         await productsAPI.create(formData);
//         toast({ title: "Product created" });
//       }

//       navigate("/admin/products");
//     } catch (err) {
//       toast({
//         title: "Error",
//         description: "Failed to save product",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AdminLayout>
//       <div className="max-w-4xl mx-auto p-6">
//         <h1 className="text-2xl font-bold mb-4">
//           {id ? "Edit Product" : "Add Product"}
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <Label>Name</Label>
//             <Input value={name} onChange={(e) => setName(e.target.value)} />
//           </div>

//           <div className="flex gap-4">
//             <div className="flex-1">
//               <Label>Price</Label>
//               <Input
//                 type="number"
//                 value={price}
//                 onChange={(e) => setPrice(e.target.value)}
//               />
//             </div>
//             <div className="flex-1">
//               <Label>Stock</Label>
//               <Input
//                 type="number"
//                 value={stock}
//                 onChange={(e) => setStock(e.target.value)}
//               />
//             </div>
//           </div>

//           <div>
//             <Label>Category</Label>
//             <select
//               className="w-full border p-2 rounded"
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//             >
//               <option value="">Select</option>
//               {categories.map((c) => (
//                 <option key={c._id} value={c._id}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <Label>Description</Label>
//             <textarea
//               className="w-full border p-2 rounded"
//               rows={4}
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//             />
//           </div>

//           {/* 🔥 IMAGE UPLOAD */}
//           <div>
//             <Label>Images</Label>
//             <input
//               type="file"
//               multiple
//               accept="image/*"
//               onChange={(e) =>
//                 setNewImages((prev) => [
//                   ...prev,
//                   ...Array.from(e.target.files),
//                 ])
//               }
//             />

//             {/* 🔥 IMAGE PREVIEWS + REMOVE */}
//             <div className="flex gap-3 mt-3 flex-wrap">
//               {/* Existing images */}
//               {images.map((img, index) => (
//                 <div
//                   key={index}
//                   className="relative w-24 h-24 border rounded"
//                 >
//                   <img
//                     src={img}
//                     className="w-full h-full object-cover rounded"
//                   />
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setImages((prev) =>
//                         prev.filter((_, i) => i !== index)
//                       )
//                     }
//                     className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full"
//                   >
//                     ✕
//                   </button>
//                 </div>
//               ))}

//               {/* New images */}
//               {newImages.map((file, index) => (
//                 <div
//                   key={index}
//                   className="relative w-24 h-24 border rounded"
//                 >
//                   <img
//                     src={URL.createObjectURL(file)}
//                     className="w-full h-full object-cover rounded"
//                   />
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setNewImages((prev) =>
//                         prev.filter((_, i) => i !== index)
//                       )
//                     }
//                     className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full"
//                   >
//                     ✕
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <Button disabled={loading}>
//             {loading ? "Saving..." : "Save Product"}
//           </Button>
//         </form>
//       </div>
//     </AdminLayout>
//   );
// }
