# Quick Start Guide

## 🚀 Your New Pipeline System is Ready!

I've successfully transformed your backend into a **world-class, scalable pipeline architecture** that can process multiple books (CSV, Excel) and support 10+ features.

## ✅ What's Been Implemented

### Core System
- ✅ **Pipeline Orchestrator** - Coordinates all processing stages
- ✅ **5 Pipeline Stages** - Ingestion → Validation → Cleaning → Embedding → Indexing
- ✅ **Document Processors** - CSV & Excel support (extensible)
- ✅ **Collection Manager** - Manage multiple document collections
- ✅ **Metrics & Monitoring** - Track performance and errors
- ✅ **CLI Tool** - Easy command-line interface

### Pre-Configured Collections
- ✅ **Bhagavad Gita** - 1 CSV file (enabled)
- ✅ **Ramayana** - 5 CSV files (enabled)
- ⏸️ **Mahabharata** - 1 CSV file (disabled)
- ⏸️ **Mahapuranas** - 1 Excel file (disabled)

## 🎯 Quick Commands

### 1. Test the System
```bash
python test_pipeline.py
```

### 2. List Available Collections
```bash
python cli.py list-collections
```

### 3. Process Bhagavad Gita
```bash
python cli.py run --collection bhagavad_gita
```

### 4. Process Ramayana (5 files)
```bash
python cli.py run --collection ramayana
```

### 5. Check Processing Status
```bash
python cli.py status --collection bhagavad_gita
```

## 📊 What Happens When You Run the Pipeline

```
1. INGESTION
   ↓ Loads CSV/Excel files
   ↓ Extracts documents
   
2. VALIDATION
   ↓ Validates document structure
   ↓ Checks required fields
   
3. CLEANING
   ↓ Normalizes text
   ↓ Removes special characters
   
4. EMBEDDING
   ↓ Generates vector embeddings
   ↓ Uses sentence-transformers
   
5. INDEXING
   ↓ Creates FAISS index
   ↓ Creates BM25 index
   ↓ Creates ChromaDB collection
   ↓ Saves processed documents
   
✅ COMPLETE
   → artifacts/{collection}/
      ├── embeddings.npy
      ├── faiss.index
      ├── bm25.pkl
      ├── chroma/
      ├── documents.parquet
      ├── manifest.json
      └── metrics.json
```

## 📁 Output Structure

After processing, each collection has its own directory:

```
artifacts/
├── bhagavad_gita/
│   ├── embeddings.npy          # Vector embeddings
│   ├── faiss.index             # FAISS vector index
│   ├── bm25.pkl                # BM25 text index
│   ├── chroma/                 # ChromaDB collection
│   ├── documents.parquet       # Processed documents
│   ├── manifest.json           # Processing metadata
│   ├── metrics.json            # Performance metrics
│   └── collection_manifest.json # Collection info
└── ramayana/
    └── ... (same structure)
```

## 🔧 Adding New Collections

### Step 1: Add Your Data Files
Place your CSV or Excel files in the `data/` directory.

### Step 2: Configure the Collection
Edit `config/collections.yaml`:

```yaml
collections:
  my_new_collection:
    source_files:
      - data/my_file.csv
    processor: csv
    schema_mapping:
      content: text_column
      metadata:
        - author
        - chapter
    embedding_model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
    enabled: true
```

### Step 3: Process It
```bash
python cli.py run --collection my_new_collection
```

## 🎨 Schema Mapping Examples

### Single Content Field
```yaml
schema_mapping:
  content: combined_text
  metadata:
    - verse_number
    - chapter
```

### Multiple Content Fields (Combined)
```yaml
schema_mapping:
  content:
    - translation
    - meaning
    - commentary
  metadata:
    - verse_number
```

### Custom Metadata Mapping
```yaml
schema_mapping:
  content: text
  metadata:
    source_chapter: chapter
    source_verse: verse
```

## 🔍 Monitoring & Debugging

### View Processing Logs
Logs are in the console output and saved to log files.

### Check Manifest
```bash
cat artifacts/bhagavad_gita/manifest.json
```

### View Metrics
```bash
cat artifacts/bhagavad_gita/metrics.json
```

### Resume Failed Pipeline
If a stage fails, you can resume from that stage:
```bash
python cli.py run --collection bhagavad_gita --start-stage embedding
```

## 🚨 Troubleshooting

### "Collection not found"
- Check `config/collections.yaml` has the collection defined
- Verify the collection name matches exactly

### "File not found"
- Check source file paths in `config/collections.yaml`
- Paths should be relative to project root

### "No processor found"
- Verify file extension (.csv or .xlsx/.xls)
- Check file is not corrupted

### Import Errors
Install missing dependencies:
```bash
pip install pandas numpy pyyaml click sentence-transformers faiss-cpu chromadb rank-bm25 openpyxl
```

## 📚 Documentation

- **PIPELINE_README.md** - Complete user guide
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **QUICK_START.md** - This file

## 🎯 Next Steps

### 1. Process Your Data
```bash
# Start with Bhagavad Gita (smallest)
python cli.py run --collection bhagavad_gita

# Then process Ramayana (5 files)
python cli.py run --collection ramayana
```

### 2. Enable More Collections
Edit `config/collections.yaml` and set `enabled: true` for:
- mahabharata
- mahapuranas

### 3. Add Your Own Collections
Follow the "Adding New Collections" guide above.

### 4. Build Features
Use the processed data in `artifacts/` to build:
- QA systems (like your current one)
- Search engines
- Analytics dashboards
- Recommendation systems

### 5. Migrate Existing QA System
Your current QA system can be updated to use the new processed data:
- Load embeddings from `artifacts/{collection}/embeddings.npy`
- Load FAISS index from `artifacts/{collection}/faiss.index`
- Load documents from `artifacts/{collection}/documents.parquet`

## 🎉 Success!

Your backend is now:
- ✅ **Modular** - Easy to extend and maintain
- ✅ **Scalable** - Process multiple collections in parallel
- ✅ **Robust** - Comprehensive error handling
- ✅ **Observable** - Full metrics and logging
- ✅ **Production-Ready** - World-class architecture

## 💡 Pro Tips

1. **Start Small**: Process Bhagavad Gita first to test the system
2. **Check Status**: Use `status` command to monitor progress
3. **Resume on Failure**: Use `--start-stage` to resume from failed stage
4. **Monitor Metrics**: Check `metrics.json` for performance insights
5. **Batch Processing**: Process multiple collections overnight

## 🆘 Need Help?

1. Check the logs in console output
2. Review `manifest.json` for processing details
3. Check `metrics.json` for performance data
4. Read `PIPELINE_README.md` for detailed documentation

---

**Ready to go!** Start with:
```bash
python cli.py run --collection bhagavad_gita
```

🚀 Happy processing!
