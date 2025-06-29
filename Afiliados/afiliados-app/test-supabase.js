const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase (mesmas do environment.ts)
const supabaseUrl = 'https://osmkbbctdpnkmubnxpqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbWtiYmN0ZHBua211Ym54cHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDgxNjEsImV4cCI6MjA2Njc4NDE2MX0.i7hQgLT83NDC_TI4PvzhyCp62Z-OaygAHj-g_azg55M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔗 Testando conexão com Supabase...');
  
  try {
    // Testar conexão básica
    const { data: niches, error: nichesError } = await supabase
      .from('niches')
      .select('id, name, slug')
      .limit(5);
    
    if (nichesError) {
      console.error('❌ Erro ao buscar nichos:', nichesError);
      return;
    }
    
    console.log('✅ Conexão OK! Nichos encontrados:', niches);
    
    // Testar busca de produtos de beleza
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        title,
        current_price,
        image_url,
        affiliate_url,
        heat_score,
        niches!inner(slug),
        created_at
      `)
      .eq('status', 'approved')
      .eq('is_active', true)
      .eq('niches.slug', 'beleza')
      .order('heat_score', { ascending: false })
      .limit(5);
    
    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
      return;
    }
    
    console.log('✅ Produtos de beleza encontrados:', products?.length || 0);
    
    if (products && products.length > 0) {
      console.log('\n📦 Primeiros produtos:');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} - R$ ${product.current_price}`);
      });
    } else {
      console.log('⚠️ Nenhum produto encontrado. Execute o SQL para inserir dados.');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  }
}

testConnection(); 