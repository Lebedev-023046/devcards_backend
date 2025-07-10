/**
 * Custom operation sorter for Swagger UI
 * Orders: GET, POST, PATCH, DELETE
 */
export function customOperationSorter(
  a: { get: (key: string) => string },
  b: { get: (key: string) => string },
): number {
  const order = ['get', 'post', 'put', 'patch', 'delete'];
  return order.indexOf(a.get('method')) - order.indexOf(b.get('method'));
}
