import { ImageResponse } from 'next/og';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product');
    const type = searchParams.get('type') || 'home';

    if (type === 'home') {
      return new ImageResponse(
        (
          <div
            style={{
              width: '1200px',
              height: '630px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #8dc63f 0%, #6aa82e 100%)',
              fontFamily: 'system-ui',
              color: 'white',
              position: 'relative',
              padding: '40px',
            }}
          >
            <div style={{ textAlign: 'center', zIndex: 10 }}>
              <div style={{ fontSize: '72px', fontWeight: 'bold', marginBottom: '20px' }}>
                Hipermascota Rafaela
              </div>
              <div style={{ fontSize: '40px', marginBottom: '30px', opacity: 0.9 }}>
                Accesorios para Perros y Gatos
              </div>
              <div style={{ fontSize: '28px', opacity: 0.8 }}>
                Envío Gratis • Pedido por WhatsApp
              </div>
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    if (type === 'product' && productId) {
      const supabase = await createClient();
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', parseInt(productId))
        .single();

      if (!product) {
        return new ImageResponse(
          (
            <div
              style={{
                width: '1200px',
                height: '630px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f0f0f0',
              }}
            >
              <div style={{ fontSize: '40px' }}>Producto no encontrado</div>
            </div>
          ),
          { width: 1200, height: 630 }
        );
      }

      const salePrice = product.sale_price && product.sale_price > 0 && product.sale_price < product.price;
      const displayPrice = salePrice ? product.sale_price : product.price;
      const discount = salePrice ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;

      return new ImageResponse(
        (
          <div
            style={{
              width: '1200px',
              height: '630px',
              display: 'flex',
              alignItems: 'stretch',
              background: 'white',
              fontFamily: 'system-ui',
              padding: '40px',
              gap: '40px',
            }}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f5f5',
                borderRadius: '20px',
              }}
            >
              <div style={{ fontSize: '80px' }}>📦</div>
            </div>
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: '32px', color: '#999', marginBottom: '10px' }}>
                Hipermascota Rafaela
              </div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#000', marginBottom: '20px', lineHeight: 1.2 }}>
                {product.name}
              </div>
              <div style={{ fontSize: '28px', color: '#666', marginBottom: '20px' }}>
                {product.description?.substring(0, 100) || 'Producto de calidad'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '52px', fontWeight: 'bold', color: '#8dc63f' }}>
                  ${displayPrice.toFixed(2)}
                </div>
                {salePrice && (
                  <>
                    <div style={{ fontSize: '32px', color: '#999', textDecoration: 'line-through' }}>
                      ${product.price.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#d84949', background: '#ffe0e0', padding: '8px 16px', borderRadius: '8px' }}>
                      -{discount}%
                    </div>
                  </>
                )}
              </div>
              <div style={{ fontSize: '20px', color: '#8dc63f', marginTop: '30px', fontWeight: 'bold' }}>
                ✓ Envío Gratis • Pedido por WhatsApp
              </div>
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f0f0',
            fontSize: '40px',
          }}
        >
          Hipermascota Rafaela
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (error) {
    console.error('OG image generation error:', error);
    return new ImageResponse(
      (
        <div style={{ width: '1200px', height: '630px', background: '#f0f0f0' }} />
      ),
      { width: 1200, height: 630 }
    );
  }
}
