import supabase from '../lib/supabase';

// 🚀 KRITISCHE DATENBANK-REPARATUR FUNKTION
export const repairDatabaseSchema = async () => {
  try {
    console.log('🔧 Starting comprehensive database repair...');
    
    const repairs = [];
    
    // 1. Check and repair topics_sb2024 table
    try {
      console.log('🔍 Checking topics_sb2024 table schema...');
      
      // Test if owner_id column exists
      const { data, error } = await supabase
        .from('topics_sb2024')
        .select('id, owner_id')
        .limit(1);
      
      if (error && error.message.includes('column "owner_id" does not exist')) {
        console.log('❌ owner_id column missing! Repairing...');
        
        // Method 1: Try direct SQL execution
        try {
          const { error: sqlError } = await supabase.rpc('exec_sql', {
            sql: `
              ALTER TABLE topics_sb2024 ADD COLUMN IF NOT EXISTS owner_id UUID;
              CREATE INDEX IF NOT EXISTS idx_topics_sb2024_owner_id ON topics_sb2024(owner_id);
              COMMENT ON COLUMN topics_sb2024.owner_id IS 'References the user who owns this topic';
            `
          });
          
          if (!sqlError) {
            console.log('✅ owner_id column created via RPC!');
            repairs.push('topics_sb2024.owner_id created');
          } else {
            console.warn('⚠️ RPC method failed:', sqlError);
            throw sqlError;
          }
        } catch (rpcError) {
          console.log('📝 RPC failed, using alternative method...');
          
          // Method 2: Try using Supabase management API
          try {
            const response = await fetch(`https://api.supabase.com/v1/projects/klmwjwwkyjsmtjycuiaf/database/query`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
              },
              body: JSON.stringify({
                query: 'ALTER TABLE topics_sb2024 ADD COLUMN IF NOT EXISTS owner_id UUID;'
              })
            });
            
            if (response.ok) {
              console.log('✅ owner_id column created via API!');
              repairs.push('topics_sb2024.owner_id created via API');
            } else {
              throw new Error('API method also failed');
            }
          } catch (apiError) {
            console.error('❌ All automatic methods failed:', apiError);
            repairs.push('MANUAL INTERVENTION REQUIRED for topics_sb2024.owner_id');
          }
        }
      } else if (!error) {
        console.log('✅ owner_id column already exists!');
        repairs.push('topics_sb2024.owner_id already exists');
      }
    } catch (error) {
      console.error('❌ Error checking topics table:', error);
      repairs.push('ERROR checking topics_sb2024');
    }
    
    // 2. Verify all other tables exist
    const requiredTables = [
      'subjects_sb2024',
      'trainings_sb2024', 
      'training_modules_sb2024',
      'topics_sb2024',
      'learning_units_sb2024',
      'invitation_codes_sb2024',
      'users_sb2024',
      'ideas_sb2024'
    ];
    
    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('id')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Table ${tableName} exists`);
          repairs.push(`${tableName} exists`);
        } else {
          console.warn(`⚠️ Table ${tableName} issue:`, error.message);
          repairs.push(`${tableName} needs attention`);
        }
      } catch (error) {
        console.error(`❌ Error checking ${tableName}:`, error);
        repairs.push(`ERROR checking ${tableName}`);
      }
    }
    
    console.log('🎉 Database repair completed!');
    console.log('📋 Repair summary:', repairs);
    
    return {
      success: true,
      repairs: repairs,
      needsManualIntervention: repairs.some(r => r.includes('MANUAL INTERVENTION'))
    };
    
  } catch (error) {
    console.error('💥 Database repair completely failed:', error);
    return {
      success: false,
      error: error.message,
      needsManualIntervention: true
    };
  }
};

// Run repair immediately when this module is imported
console.log('🚀 Auto-executing database repair...');
repairDatabaseSchema().then(result => {
  if (result.success) {
    console.log('🎉 Database auto-repair completed!');
    if (result.needsManualIntervention) {
      console.warn(`
⚠️ MANUAL SQL REQUIRED:
Please execute this in Supabase SQL Editor:

ALTER TABLE topics_sb2024 ADD COLUMN IF NOT EXISTS owner_id UUID;
CREATE INDEX IF NOT EXISTS idx_topics_sb2024_owner_id ON topics_sb2024(owner_id);

This will fix the owner assignment issue permanently!
      `);
    }
  } else {
    console.error('❌ Database auto-repair failed:', result.error);
  }
});

export default repairDatabaseSchema;