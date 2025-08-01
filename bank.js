import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient('https://zxscejbxgriqexnimgmv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4c2NlamJ4Z3JpcWV4bmltZ212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTc5ODAsImV4cCI6MjA2OTQ3Mzk4MH0.oOqozr4_9CarbbfhihCibGa-ErZ_fKjHsj_KPaMLhiM');

async function processCards() {
  // 1. Fetch card records (use pagination/batching for large data)
  const { data: cards, error } = await supabase
    .from('card')
    .select('id, card_number');
  if (error) throw error;

  for (const card of cards) {
    const binCode = card.card_number.slice(0, 6);
    // 2. Fetch bin info
    const { data: binData } = await axios.get(
      `https://api.bincodes.com/bin/json/aca1ee4703fcab267c9e0ed64a4fe2eb/${binCode}/`
    );
    console.log(binData)
    // 3. Clean website field
    let website = binData.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
    // 4. Update Supabase record
    await supabase
      .from('card')
      .update({ bank: website })
      .eq('id', card.id);
  }
}

processCards().catch(console.error);