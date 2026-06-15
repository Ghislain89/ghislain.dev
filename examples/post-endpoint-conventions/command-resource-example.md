# Command Resource Example

The REST resource only translates HTTP into a command. Business logic stays in
the domain; validation happens on the request DTO; the response is a DTO, never
the aggregate.

```java
@Path("/orders")
public class CreateOrderResource {

    @Inject
    CreateOrderHandler handler; // business logic lives in the domain, not here

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response create(@Valid CreateOrderRequest request) { // Jakarta validation
        OrderId id = handler.handle(request.toCommand());
        return Response.status(Response.Status.CREATED)
                       .entity(new CreateOrderResponse(id.value())) // response DTO
                       .build();
    }
}
```
