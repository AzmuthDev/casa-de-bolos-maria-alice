# Casa de Bolos Maria Alice — site

Site do cardápio com bolos em 3D e pedido direto pelo WhatsApp.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera a pasta dist/ para publicar
```

## Onde mudar as coisas

Tudo que muda com frequência fica em `src/data/cardapio.ts`:

- **WhatsApp**: `WHATSAPP_NUMBER` (só dígitos: 55 + DDD + número) e `WHATSAPP_DISPLAY` (como aparece no rodapé).
- **Instagram**: `INSTAGRAM_HANDLE`.
- **Bolos e preços**: lista `cakes`. Cada bolo tem `name` (como aparece no cardápio), `orderName` (como vai na mensagem do WhatsApp), `price`, `category`, `description` e `look` (aparência 3D).
- **Bolos do topo da página**: `heroCakeIds`.
- **Mensagem do pedido**: função `orderMessage`.

### Aparência 3D de um bolo (`look`)

- `shape`: `'bundt'` (com furo), `'round'` (redondo) ou `'loaf'` (de forma).
- `crumb` / `crust`: cor do miolo e da casca.
- `glaze`: cobertura que escorre, ex. `{ color: '#3A1F15', drips: 1 }`.
- `topping`: o que vai por cima (`sprinkles`, `sugar`, `goiabada`, `citrus`, `toasted-coconut`, `chips`, `zest`, `lime`, `banana`, `apple`, `cinnamon-sugar` ou `none`).
- `inclusion`: o que aparece no corte (`goiabada`, `requeijao`, `coco`, `granulado`, `gotas`, `banana`, `maca`, `creme`).

Os modelos são gerados por código em `src/three/` — não há arquivos 3D para baixar.

O site anterior está guardado em `_site-antigo/` (pode apagar quando não precisar mais).
