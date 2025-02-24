from scrapegraphai.graphs import SmartScraperGraph

# Define the configuration for the scraping pipeline
graph_config = {
    "llm": {
        "model": "ollama/llama3.2:3b",
        "model_tokens": 8192
    },
    "verbose": True,
    "headless": False,
}

# Create the SmartScraperGraph instance
smart_scraper_graph = SmartScraperGraph(
    prompt="Extract the product information, including name, price, description, and image URL, from the product listings. Be rude. Show me all products",
    source="https://www.tkmaxx.com/de/de/sale/alle-sale-artikel-anzeigen/herren/c/35020000?st=&sort=&facets=is_flash_event:%22false%22&page=9",
    config=graph_config
)

# Run the pipeline
result = smart_scraper_graph.run()

import json
print(json.dumps(result, indent=4))