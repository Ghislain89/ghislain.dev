# Command Test Example

Two cases the skill asks for: the happy path returns `201`, and an invalid
request is rejected with `400` before it reaches the domain.

```java
class CreateOrderResourceTest {

    @Test
    void createsOrder_returns201() {
        given()
            .contentType(JSON)
            .body("""
                  { "customerId": "c-1", "sku": "SKU-1", "quantity": 2 }
                  """)
        .when()
            .post("/orders")
        .then()
            .statusCode(201)
            .body("id", notNullValue());
    }

    @Test
    void rejectsInvalidRequest_returns400() {
        given()
            .contentType(JSON)
            .body("""
                  { "customerId": "", "quantity": 0 }
                  """)
        .when()
            .post("/orders")
        .then()
            .statusCode(400); // Jakarta validation rejects it before the domain
    }
}
```
