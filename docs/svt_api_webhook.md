# SVT API Webhook (`/svt_api/webhook`) – Datatable + model_get_by

This project fetches data via a Phoenix endpoint:

- **Endpoint**: `GET /svt_api/webhook`
- **Routing**: `scope` query param selects behavior (see `netsphere/lib/commerce_front_web/controllers/api_controller.ex`)

In `svt_commerce`, requests are typically made via `api_get()` which builds a querystring from a plain JS object (see `svt_commerce/src/lib/index.js`).

---

## `scope=datatable`

### What it does
Returns a **paged list** of records for the given model, plus **total count** fields for pagination.

### Required query params
- **`scope`**: `datatable`
- **`model`**: schema name (string), e.g. `MerchantProduct`
- **`length`**: page size (defaults to `10` if omitted)
- **`start`**: offset (defaults to `0` if omitted)

Important: the backend uses **DataTables** parameter names:
- Use **`length`** (not `limit`)
- Use **`start`** (not `offset`)

### Response (shape)
```json
{
  "data": [/* rows */],
  "recordsTotal": 123,
  "recordsFiltered": 123,
  "draw": 1
}
```

### Pagination examples
If page size is 12:
- Page 1: `length=12&start=0`
- Page 2: `length=12&start=12`
- Page 3: `length=12&start=24`

Example URL:
- `GET /svt_api/webhook?scope=datatable&model=MerchantProduct&length=12&start=12`

### Filtering via `additional_search`
You can pass additional filters using **`additional_search`** as a **JSON string** (array of objects).

Each filter item:
- **`column`**: column name (string)
- **`value`**: value (string/number/boolean)
- **`prefix`**: query binding prefix, usually:
  - `a` = base schema
  - `b` = first join
  - `c` = second join
  - etc
- **`operator`**:
  - `ilike` → `ilike(prefix.column, "%value%")`
  - `!=` → not equal
  - anything else → equality

Example: “approved products” + “name contains shoe”

- `additional_search=[{"column":"is_approved","value":true,"prefix":"b","operator":"="},{"column":"name","value":"shoe","prefix":"a","operator":"ilike"}]`

Example URL (wrapped for readability):
- `GET /svt_api/webhook?scope=datatable&model=MerchantProduct&length=12&start=0&additional_search=...`

### Joining via `additional_joins`
You can pass **`additional_joins`** as a **JSON string** (array of objects).

Each join item:
- **`join_suffix`**: the “from” binding to join from (commonly `a`)
- **`assoc`**: Ecto assoc name on that binding (string)
- **`prefix`**: the new binding variable name (commonly `b`, `c`, ...)

Example: join product’s merchant:
- `additional_joins=[{"join_suffix":"a","assoc":"merchant","prefix":"b"}]`

### Preloads via `preloads`
You can pass **`preloads`** as a JSON string array of assoc names:
- `preloads=["merchant","merchant_product_category"]`

---

## `scope=model_get_by`

### What it does
Returns **one** record matching the provided fields (similar to `Repo.get_by`).

### Required query params
- **`scope`**: `model_get_by`
- **`model`**: schema name (string), e.g. `Merchant`

### Filter params
Any other query params become the `get_by` conditions (after removing `scope` + `model`).

Example: get merchant by id:
- `GET /svt_api/webhook?scope=model_get_by&model=Merchant&id=123`

### Response
- A single record (sanitized struct as JSON), or `null` if nothing matches.

---

## Common pitfalls

### “Why do I only get 10 rows?”
For `scope=datatable`, the backend defaults to:
- `length = 10` if you don’t pass **`length`**

Passing `limit=200` does **not** affect pagination for `datatable`. Use:
- `length=200&start=0`

### “How do I do LIKE search?”
Use `operator: "ilike"` in `additional_search`.

Example:
- `{"column":"name","value":"shoe","prefix":"a","operator":"ilike"}`


