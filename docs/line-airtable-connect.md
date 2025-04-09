# LINE Connect and Airtable Connect Services

This document provides an overview of the two new microservices that have been implemented to extend the existing system:

1. **LINE Connect**: For sending notifications and messages to LINE groups
2. **Airtable Connect**: For synchronizing data with Airtable

## LINE Connect Service

### Purpose

The LINE Connect service allows the system to send automated messages to LINE groups, enabling timely notifications about inventory levels, sales reports, order status updates, and other important information.

### Key Features

- Send text messages to one or multiple LINE groups
- Send image messages (using image URLs)
- Track message delivery status
- Manage LINE group registrations
- Support for webhook events from LINE platform

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/line/messages` | POST | Send a message to LINE groups |
| `/api/line/messages/history` | GET | Get message history |
| `/api/line/groups` | GET | List all registered LINE groups |
| `/api/line/groups` | POST | Register a new LINE group |
| `/api/line/groups/{id}` | PUT | Update a LINE group |
| `/api/line/groups/{id}` | DELETE | Remove a LINE group |
| `/webhook/line` | POST | Endpoint for LINE platform to send events |

### Configuration

LINE Connect requires the following environment variables:
- `LINE_CHANNEL_SECRET`: Secret key from LINE Developer Console
- `LINE_CHANNEL_TOKEN`: Access token from LINE Developer Console
- `DATABASE_URL`: PostgreSQL connection string

### Use Cases

1. **Inventory Alerts**: Send notifications when stock levels are low
2. **Daily Reports**: Send automated daily summaries of sales or inventory
3. **Order Notifications**: Notify teams when new orders are placed
4. **Critical Alerts**: Send urgent notifications for system issues

## Airtable Connect Service

### Purpose

The Airtable Connect service provides bidirectional synchronization between the system's database and Airtable, allowing easy data visualization, reporting, and collaboration using Airtable's features.

### Key Features

- Configure mapping between system tables and Airtable
- Push data from system to Airtable
- Pull data from Airtable to system
- Schedule automatic synchronization
- Track sync history and errors

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/airtable/tables` | GET | List all table configurations |
| `/api/airtable/tables` | POST | Create a new table configuration |
| `/api/airtable/table` | GET | Get a specific table configuration |
| `/api/airtable/table` | PUT | Update a table configuration |
| `/api/airtable/table` | DELETE | Delete a table configuration |
| `/api/airtable/sync` | POST | Sync all tables or a specific table |
| `/api/airtable/status` | GET | Get sync status |

### Configuration

Airtable Connect requires the following environment variables:
- `AIRTABLE_ACCESS_TOKEN`: API key from Airtable
- `AIRTABLE_BASE_ID`: Airtable base ID to connect to
- `DATABASE_URL`: PostgreSQL connection string

### Use Cases

1. **Inventory Management**: Sync stock levels to Airtable for easy visualization
2. **Sales Analytics**: Push sales data to Airtable for custom reports and dashboards
3. **Customer Management**: Synchronize customer information with Airtable for CRM
4. **Order Tracking**: Maintain up-to-date order status in Airtable

## Integration Examples

### Sending Low Stock Alerts via LINE

```go
func checkInventoryLevels() {
    items, _ := inventoryRepo.GetItems()
    
    for _, item := range items {
        if item.InStock < item.MinimumLevel {
            // Send low stock alert via LINE Connect
            http.Post(
                "http://line-connect:8085/api/line/messages",
                "application/json",
                strings.NewReader(fmt.Sprintf(`{
                    "content": "🚨 Low Stock Alert: %s (%.0f units remaining)",
                    "group_ids": ["inventory_alerts"],
                    "type": "text"
                }`, item.Name, item.InStock)),
            )
        }
    }
}
```

### Syncing Sales Data to Airtable

```go
func syncDailySales() {
    // Trigger Airtable sync for sales data
    http.Post(
        "http://airtable-connect:8086/api/airtable/sync?id=2", // Assuming sales table has ID 2
        "application/json",
        strings.NewReader(`{}`),
    )
}
```

## Architecture Diagram

```
┌───────────────┐      ┌─────────────────┐     ┌───────────────┐
│  Inventory    │      │      Sales      │     │   Supplier    │
│  Management   │◄────►│    Management   │◄───►│  Management   │
└───────┬───────┘      └────────┬────────┘     └───────┬───────┘
        │                       │                      │
        │                       │                      │
        ▼                       ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                       Database                              │
└──────────┬─────────────────────────────────┬───────────────┘
           │                                 │
           ▼                                 ▼
┌──────────────────┐                ┌──────────────────────┐
│  LINE Connect    │                │   Airtable Connect   │
└────────┬─────────┘                └───────────┬──────────┘
         │                                      │
         ▼                                      ▼
┌──────────────────┐                ┌──────────────────────┐
│   LINE Platform  │                │       Airtable       │
└──────────────────┘                └──────────────────────┘
```

## Setup Instructions

1. Add the environment variables to your .env file
2. Run the database migrations
3. Update docker-compose.yml to include the new services
4. Build and start the containers
5. Configure LINE groups and Airtable table mappings

## Conclusion

These two services extend the system's capabilities by enabling:

1. Real-time notifications via LINE
2. Data visualization and reporting via Airtable
3. Better team collaboration through automated messaging
4. Improved data sharing with external stakeholders

By integrating LINE Connect and Airtable Connect, the system can provide more value through automated communication and enhanced data accessibility.