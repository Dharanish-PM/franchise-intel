# Franchise Intel Backend - New Database Schema

## Database Structure

### Tables Created

1. **brand** - Stores brand information
   - id (PK)
   - name
   - industry
   - created_at

2. **franchise** - Stores franchise/store locations
   - id (PK)
   - brand_id (FK → brand)
   - franchise_code (unique)
   - city, state, country
   - owner_name
   - opened_date
   - status

3. **product** - Products offered by brands
   - id (PK)
   - brand_id (FK → brand)
   - name
   - category
   - price
   - is_active

4. **inventory** - Stock levels per franchise
   - id (PK)
   - franchise_id (FK → franchise)
   - product_id (FK → product)
   - quantity_available
   - last_updated
   - UNIQUE(franchise_id, product_id)

5. **customer** - Customer information
   - id (PK)
   - name
   - phone
   - created_at

6. **orders** - Order transactions
   - id (PK)
   - franchise_id (FK → franchise)
   - customer_id (FK → customer)
   - order_date
   - total_amount
   - payment_mode
   - status

7. **order_item** - Line items in orders
   - id (PK)
   - order_id (FK → orders, CASCADE DELETE)
   - product_id (FK → product)
   - quantity
   - price_at_sale

8. **app_user** - Application users with role-based access
   - id (PK)
   - username (unique)
   - email (unique)
   - password_hash
   - role (ADMIN, BRAND_MANAGER, STORE_MANAGER, SALES)
   - brand_id (FK → brand)
   - franchise_id (FK → franchise, nullable)
   - is_active
   - created_at
   - CHECK: ADMIN/BRAND_MANAGER must have franchise_id = NULL
   - CHECK: STORE_MANAGER/SALES must have franchise_id NOT NULL

## Entities Created

All entities are in `src/main/java/com/franchiseintel/entity/`:
- Brand.java
- Franchise.java
- Product.java
- Inventory.java
- Customer.java
- Order.java
- OrderItem.java
- AppUser.java

## Repositories Created

All repositories are in `src/main/java/com/franchiseintel/repository/`:
- BrandRepository
- FranchiseRepository
- ProductRepository
- InventoryRepository
- CustomerRepository
- OrderRepository
- OrderItemRepository
- AppUserRepository (with findByUsername and findByEmail methods)

## Configuration

### Database Connection (application.properties)
```
spring.datasource.url=jdbc:postgresql://localhost:5432/franchiseManager
spring.datasource.username=dharanish
spring.datasource.password=1234
spring.jpa.hibernate.ddl-auto=update
```

### Test Endpoints

**GET /api/test/ping**
- Returns: Server status

**GET /api/test/count**
- Returns: Count of records in all tables

## Next Steps

1. Start PostgreSQL database
2. Run the application: `mvn spring-boot:run`
3. Test endpoints: http://localhost:8080/api/test/ping
4. Access Swagger UI: http://localhost:8080/api/swagger-ui/index.html
5. Create DTOs, Services, and Controllers for each entity as needed

## Removed Components

- All S3-related code (AwsS3Config, AwsS3Service, UserController)
- Old entities (Store, ActivityLog, Notification, InventoryItem)
- Old DTOs, Services, Controllers, and Mappers
- AWS S3 dependencies from pom.xml
- S3 configuration from application.properties

## Technology Stack

- Spring Boot 3.2.0
- Java 21
- PostgreSQL
- Spring Data JPA
- Lombok
- Spring Security
- Swagger/OpenAPI
