import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useStore } from '../store';
import { Product } from '../types';

export const ProductList: React.FC = () => {
  const { t } = useTranslation();
  const { products = [], settings, addProduct, updateProduct, removeProduct, addCategory } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'categories'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  const categories = settings?.categories || ['food', 'drink'];
  
  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const product: Product = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      image: `https://source.unsplash.com/random/200x200/?${formData.get('category')},food`
    };
    
    addProduct(product);
    form.reset();
  };

  const handleUpdateProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const updatedProduct: Product = {
      ...editingProduct,
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
    };
    
    updateProduct(updatedProduct);
    setEditingProduct(null);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
      setShowNewCategory(false);
    }
  };

  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('products.allProducts')}
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'categories'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('products.byCategory')}
        </button>
      </div>
      
      <form onSubmit={handleAddProduct} className="mb-6 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <input
            name="name"
            placeholder={t('products.name')}
            required
            className="border p-2 rounded"
          />
          <input
            name="price"
            type="number"
            step="0.01"
            placeholder={t('products.price')}
            required
            className="border p-2 rounded"
          />
          <select
            name="category"
            required
            className="border p-2 rounded"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('products.add')}
          </button>
        </div>
      </form>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t('products.categories')}</h3>
        <button
          onClick={() => setShowNewCategory(true)}
          className="text-blue-500 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('products.newCategory')}
        </button>
      </div>
      
      {showNewCategory && (
        <form onSubmit={handleAddCategory} className="mb-6 flex gap-4">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder={t('products.categoryName')}
            className="flex-1 border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            {t('common.add')}
          </button>
          <button
            type="button"
            onClick={() => setShowNewCategory(false)}
            className="bg-gray-100 px-4 py-2 rounded"
          >
            {t('common.cancel')}
          </button>
        </form>
      )}
      
      {activeTab === 'all' ? (
        <div className="grid grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 space-y-2"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="font-semibold">{product.name}</h3>
              <p>${product.price.toFixed(2)}</p>
              <p className="text-gray-600">{product.category}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="flex-1 text-blue-500 flex items-center justify-center gap-1"
                >
                  <Pencil className="w-4 h-4" />
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="flex-1 text-red-500 flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('common.remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-xl font-semibold mb-4">
                {category}
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {(productsByCategory[category] || []).map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded"
                    />
                    <h3 className="font-semibold">{product.name}</h3>
                    <p>${product.price.toFixed(2)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="flex-1 text-blue-500 flex items-center justify-center gap-1"
                      >
                        <Pencil className="w-4 h-4" />
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="flex-1 text-red-500 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('common.remove')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{t('products.editProduct')}</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('products.name')}
                </label>
                <input
                  name="name"
                  defaultValue={editingProduct.name}
                  required
                  className="mt-1 block w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('products.price')}
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingProduct.price}
                  required
                  className="mt-1 block w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('products.category')}
                </label>
                <select
                  name="category"
                  defaultValue={editingProduct.category}
                  required
                  className="mt-1 block w-full border rounded-lg px-3 py-2"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-100 py-2 rounded-lg hover:bg-gray-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};