import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import styles from './ProductManagement.module.css'

function ProductManagement() {
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: 'hdpe_bags',
    description: '',
    regular_price: '',
    wholesale_price_tiers: [],
    regular_moq: '',
    wholesale_moq: '',
    is_bargaining_allowed: true,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.products)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData)
      } else {
        await api.post('/products', formData)
      }
      setShowForm(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description || '',
      regular_price: product.regular_price,
      wholesale_price_tiers: product.wholesale_price_tiers || [],
      regular_moq: product.regular_moq,
      wholesale_moq: product.wholesale_moq,
      is_bargaining_allowed: product.is_bargaining_allowed,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm(t('pm.deactivateConfirm'))) {
      try {
        await api.delete(`/products/${id}`)
        fetchProducts()
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'hdpe_bags',
      description: '',
      regular_price: '',
      wholesale_price_tiers: [],
      regular_moq: '',
      wholesale_moq: '',
      is_bargaining_allowed: true,
    })
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>{t('admin.products')}</h1>
          <button 
            onClick={() => { setShowForm(true); setEditingProduct(null); resetForm(); }}
            className={styles.addBtn}
          >
            {t('pm.addProduct')}
          </button>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>{editingProduct ? t('pm.editProduct') : t('pm.addNewProduct')}</h3>
                <button onClick={() => setShowForm(false)} className={styles.closeBtn}>×</button>
              </div>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>{t('pm.name')}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>{t('pm.category')}</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="hdpe_bags">{t('home.categories.hdpe_bags')}</option>
                      <option value="bopp_film">{t('home.categories.bopp_film')}</option>
                      <option value="yarn">{t('home.categories.yarn')}</option>
                      <option value="ldpe_film">{t('home.categories.ldpe_film')}</option>
                    </select>
                  </div>
                  <div className={styles.fieldFull}>
                    <label>{t('pm.description')}</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>{t('pm.regularPrice')}</label>
                    <input
                      type="number"
                      name="regular_price"
                      value={formData.regular_price}
                      onChange={handleChange}
                      step="0.01"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>{t('pm.regularMoq')}</label>
                    <input
                      type="number"
                      name="regular_moq"
                      value={formData.regular_moq}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>{t('pm.wholesaleMoq')}</label>
                    <input
                      type="number"
                      name="wholesale_moq"
                      value={formData.wholesale_moq}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="is_bargaining_allowed"
                        checked={formData.is_bargaining_allowed}
                        onChange={handleChange}
                      />
                      {t('pm.allowNegotiation')}
                    </label>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    {editingProduct ? t('pm.update') : t('pm.create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products List */}
        {loading ? (
          <div className={styles.loading}>{t('common.loading')}</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('pm.colName')}</th>
                  <th>{t('pm.colCategory')}</th>
                  <th>{t('pm.colPrice')}</th>
                  <th>{t('pm.colMoq')}</th>
                  <th>{t('pm.colStatus')}</th>
                  <th>{t('pm.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className={styles.nameCell}>{product.name}</td>
                    <td>{t(`home.categories.${product.category}`)}</td>
                    <td className={styles.priceCell}>৳{product.regular_price}/kg</td>
                    <td>{product.regular_moq} kg</td>
                    <td>
                      <span className={`${styles.statusBadge} ${product.is_active ? styles.active : styles.inactive}`}>
                        {product.is_active ? t('pm.active') : t('pm.inactive')}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button onClick={() => handleEdit(product)} className={styles.editBtn}>
                          {t('common.edit')}
                        </button>
                        <button onClick={() => handleDelete(product.id)} className={styles.deleteBtn}>
                          {t('pm.deactivate')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductManagement
