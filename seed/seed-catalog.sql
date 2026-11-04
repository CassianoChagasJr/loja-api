-- Seed parcial: só catálogo (produtos), adaptado ao schema em português.
-- Use seed.sql (completo) depois de auth + pedidos.
--
-- Rodar a partir da pasta loja-api/ (Git Bash):
--   docker exec -i loja-postgres psql -U loja -d loja -v ON_ERROR_STOP=1 < seed/seed-catalog.sql
--
-- Só funciona com o banco SEM pedidos/pagamentos: a FK de order_itens não
-- existe para produtos, mas pedidos antigos ficariam apontando para ids
-- reciclados. Com pedidos no banco, prefira seed.sql.

BEGIN;

DELETE FROM produtos;

ALTER SEQUENCE produtos_id_seq RESTART WITH 1;

INSERT INTO produtos (nome, preco, estoque) VALUES
  ('Caneca Nest', 39.90, 10),
  ('Camiseta ADS', 59.90, 25);

COMMIT;

SELECT id, nome, preco, estoque FROM produtos ORDER BY id;
