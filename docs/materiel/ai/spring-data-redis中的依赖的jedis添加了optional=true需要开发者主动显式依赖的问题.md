
# spring-data-redis中的依赖的jedis添加了`<optional>true<optional>`需要开发者主动显式依赖的问题

在 Spring Data Redis 中，`jedis` 依赖被标记为 `<optional>true</optional>` 是因为 Spring Data Redis 是一个支持多种 Redis 驱动的伞项目，包括 Jedis 和 Lettuce 等。这意味着，Spring Data Redis 本身并不强制要求项目中必须使用 Jedis，而是让开发者可以根据自己的需求选择使用哪个客户端。因此，`jedis` 依赖被设置为可选的，这样开发者只有在需要使用 Jedis 客户端时才需要显式地引入这个依赖。
关于 `<optional>true</optional>` 的具体作用，当这个标记为 `true` 时，意味着 Maven 在构建项目时，如果其他依赖已经提供了这个依赖的实现，那么这个依赖不会被添加到 classpath 中。这样做的好处是，它可以减少项目的依赖冲突和体积，尤其是在项目中已经默认使用了另一种 Redis 客户端（如 Lettuce）时。
在某些情况下，如果你在代码中明确引用了 Jedis 的类或方法，即使标记为可选，Maven 还是会将其作为编译和运行时依赖处理。因此，如果你确实需要在项目中使用 Jedis，那么你就需要显式地引入这个依赖，并将其标记为非可选（即设置 `<optional>false</optional>`），以确保项目在构建和运行时都能正确地使用 Jedis 客户端。
总的来说，`<optional>true</optional>` 的标记是为了提供灵活性，让开发者可以根据自己的需求和项目配置来决定是否引入 Jedis 依赖。引入 Jedis 依赖的正确方式取决于你是否需要在项目中使用 Jedis 客户端，以及你是否已经选择了其他 Redis 客户端（如 Lettuce）。
