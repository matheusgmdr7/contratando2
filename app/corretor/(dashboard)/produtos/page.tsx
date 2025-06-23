"use client"

const ProdutosPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Produtos</h1>

      {/* Filters and Search */}
      <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <input type="text" placeholder="Buscar produtos..." className="w-full p-2 border rounded" />
        </div>
        <div className="w-full md:w-2/3 flex flex-col md:flex-row">
          <select className="w-full md:w-1/2 p-2 border rounded mb-2 md:mb-0 md:mr-2">
            <option>Categoria</option>
            <option>Opção 1</option>
            <option>Opção 2</option>
          </select>
          <select className="w-full md:w-1/2 p-2 border rounded">
            <option>Preço</option>
            <option>Opção 1</option>
            <option>Opção 2</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Product Card 1 */}
        <div className="border rounded p-4">
          <img src="https://via.placeholder.com/150" alt="Product 1" className="w-full h-32 object-cover mb-2" />
          <h2 className="text-lg font-semibold">Produto 1</h2>
          <p className="text-gray-600">Descrição do produto 1.</p>
          <p className="font-bold">R$ 99,99</p>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
            Adicionar ao carrinho
          </button>
        </div>

        {/* Product Card 2 */}
        <div className="border rounded p-4">
          <img src="https://via.placeholder.com/150" alt="Product 2" className="w-full h-32 object-cover mb-2" />
          <h2 className="text-lg font-semibold">Produto 2</h2>
          <p className="text-gray-600">Descrição do produto 2.</p>
          <p className="font-bold">R$ 149,99</p>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
            Adicionar ao carrinho
          </button>
        </div>

        {/* Product Card 3 */}
        <div className="border rounded p-4">
          <img src="https://via.placeholder.com/150" alt="Product 3" className="w-full h-32 object-cover mb-2" />
          <h2 className="text-lg font-semibold">Produto 3</h2>
          <p className="text-gray-600">Descrição do produto 3.</p>
          <p className="font-bold">R$ 79,99</p>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProdutosPage
