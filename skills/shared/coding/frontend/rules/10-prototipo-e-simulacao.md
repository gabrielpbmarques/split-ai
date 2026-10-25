# Protótipo e servidor simulado

## Modo protótipo

<regras>
- Protótipo navegável: `prototipoAtivo` verdadeiro. Só existe com `VITE_APP_ENV=local`, `VITE_SKIP_AUTH=true` e `VITE_PROTOTIPO=true`. Vence `VITE_ENTRA_MOCK_URL`.
- No protótipo, a API é um servidor simulado no próprio navegador (`src/simulacao/`), o login é a escolha de uma persona (`/entrar`) e aparecem os controles de persona, data simulada e reinício de dados.
- Persona, contexto e mundo simulado ficam no `sessionStorage` da aba. Recarregar mantém; fechar a aba volta ao seed.
- Tela nova nasce com destino `modo: 'prototipo'`. Passa a `ambos` ou `real` quando a API real existe.
</regras>

<regra critica="true">
`prototipoAtivo` compara `import.meta.env.VITE_*` literalmente na própria expressão, e a simulação só é carregada por `import('./simulacao')` em `src/main.tsx`, atrás de `prototipoAtivo`. Código exclusivo do protótipo fora de `simulacao/` entra por `lazy(() => import('./Arquivo'))` atrás de `prototipoAtivo`.

Flag derivada de valor de runtime compila, passa no lint e nos testes, e leva o servidor simulado inteiro para o bundle de qa, uat e produção.
</regra>

<regras>
- Proibido importar `@/simulacao` fora de `src/main.tsx` e de testes.
- Proibido `import()` com caminho montado e `import.meta.glob`.
- Depois de mexer em flag, `main.tsx` ou `simulacao/`: `pnpm build` e confirmar que `dist/assets` não contém `prototipo:mundo`.
</regras>

## Estrutura da simulação

<estrutura>
```
src/simulacao/
  index.ts                  instalarSimulacao(), reiniciarSimulacaoParaTeste()
  transporte-simulado.ts    troca o fetch: lê token (persona), x-contexto-id, corpo; roteia; serializa ErrorResponse
  roteador.ts               casa método + caminho (:parametro); exige conta ativa nas rotas não públicas
  requisicao.ts             RequisicaoSimulada, RespostaSimulada, RotaSimulada
  erros.ts                  ErroSimulado e fábricas (semPermissao, recursoNaoEncontrado, requisicaoInvalida, conflito, …)
  estado.ts                 Mundo, VERSAO_DOS_DADOS, carregar/salvar/reiniciar, novoId
  relogio.ts                hojeSimulado(mundo), data simulada
  log.ts                    registrarNoLog: toda escrita
  politicas.ts              regras de ação e bloqueio (acoes/bloqueios) e segregação
  <assunto>.ts              regra de negócio simulada por assunto
  dados/                    seed por assunto
  rotas/                    rotas por recurso + index.ts (ROTAS_SIMULADAS)
    contexto-da-requisicao.ts   usuário e contexto da requisição, exigirContextoComPermissao
  aceites-*.test.ts         critérios de aceite contra o servidor simulado
```
</estrutura>

<regras>
- O servidor simulado responde nos mesmos caminhos, métodos, formatos e códigos de erro da API real. Campo ou rota que a API ainda não tem é extensão com `// DECISAO-PENDENTE: <id>`.
- `simulacao/` importa só `@/shared/contracts`, `@/api/transporte`, `@/shared-domain/acesso/permissoes` (o arquivo, não o `index.ts`) e a própria pasta. Sem `import()` dinâmico.
- Rota nova: arquivo `rotas/<recurso>.ts` exportando `rotasDe<Recurso>: readonly RotaSimulada[]`, incluído em `ROTAS_SIMULADAS` de `rotas/index.ts`.
- Toda rota não pública começa autorizando: `exigirContextoComPermissao(requisicao, mundo, PERMISSOES.<chave>)`.
- Erro é `throw` de uma fábrica de `erros.ts`. Proibido `throw new Error` para recusa de negócio (vira 500).
- Corpo recebido é `unknown`: valide forma e tipo antes de usar; inválido → `requisicaoInvalida(mensagem, detalhes)`.
- `responder` muda o `mundo` diretamente; o transporte salva o mundo depois de todo método diferente de `GET`.
- Id novo: `novoId(mundo, '<prefixo>')`. Data de hoje: `hojeSimulado(mundo)`. Toda escrita registra em `registrarNoLog`.
- Recurso com ações devolve `acoes` e `bloqueios` calculados por funções de `politicas.ts` (ou do arquivo do assunto), com o motivo em português.
- Mensagem de erro em português, escrita para a tela.
</regras>

<exemplo>
```ts
// src/simulacao/rotas/pedidos.ts
import type { DetalhePedido, PedidoDaLista } from '@/shared/contracts';
import { PERMISSOES } from '@/shared-domain/acesso/permissoes';
import { recursoNaoEncontrado } from '../erros';
import type { Mundo } from '../estado';
import { registrarNoLog } from '../log';
import { acoesDoPedido, bloqueiosDoPedido, exigirAcaoNoPedido } from '../pedidos';
import type { PedidoSimulado } from '../dados/pedidos';
import type { RotaSimulada } from '../requisicao';
import { exigirContextoComPermissao, usuarioDaRequisicao } from './contexto-da-requisicao';

function pedidoPorId(mundo: Mundo, id: string | undefined): PedidoSimulado {
const pedido = mundo.pedidos.find((item) => item.id === id);
if (!pedido) throw recursoNaoEncontrado('Pedido não encontrado.');
return pedido;
}

function detalhe(pedido: PedidoSimulado, mundo: Mundo): DetalhePedido {
return {
...pedido,
acoes: acoesDoPedido(pedido, mundo),
bloqueios: bloqueiosDoPedido(pedido, mundo),
};
}

export const rotasDePedidos: readonly RotaSimulada[] = [
{
metodo: 'GET',
caminho: '/pedidos',
responder(requisicao, mundo) {
exigirContextoComPermissao(requisicao, mundo, PERMISSOES.verPedidos);
const lista: PedidoDaLista[] = mundo.pedidos.map(
({ id, codigo, solicitante, situacao, criadoEm }) => ({
id,
codigo,
solicitante,
situacao,
criadoEm,
}),
);
return { status: 200, corpo: lista };
},
},
{
metodo: 'GET',
caminho: '/pedidos/:id',
responder(requisicao, mundo) {
exigirContextoComPermissao(requisicao, mundo, PERMISSOES.verPedidos);
return { status: 200, corpo: detalhe(pedidoPorId(mundo, requisicao.parametros.id), mundo) };
},
},
{
metodo: 'POST',
caminho: '/pedidos/:id/aprovar',
responder(requisicao, mundo) {
exigirContextoComPermissao(requisicao, mundo, PERMISSOES.aprovarPedidos);
const autor = usuarioDaRequisicao(requisicao, mundo);
const pedido = pedidoPorId(mundo, requisicao.parametros.id);
exigirAcaoNoPedido(pedido, mundo, 'aprovar');
const antes = { situacao: pedido.situacao };
pedido.situacao = 'aprovado';
registrarNoLog(mundo, {
idAutor: autor.id,
acao: 'pedido.aprovar',
tipoRecurso: 'pedido',
idRecurso: pedido.id,
idUsuarioAfetado: null,
perfilAfetado: null,
antes,
depois: { situacao: pedido.situacao },
escolaIds: [],
});
return { status: 200, corpo: detalhe(pedido, mundo) };
},
},
];

````
</exemplo>

<regras>
- Coleção nova no mundo: campo em `Mundo` (`estado.ts`), preenchido pelo seed em `criarMundoInicial`, com `VERSAO_DOS_DADOS` incrementada.
- Ação de log nova: entrada em `ROTULO_DA_ACAO` de `log.ts`. Tipo de recurso novo: valor na união `tipoRecurso` de `EntradaDoLog` (`estado.ts`).
- Regra de negócio simulada do assunto (`acoesDoPedido`, `bloqueiosDoPedido`, `exigirAcaoNoPedido`) fica em `src/simulacao/<assunto>.ts`, não no arquivo de rotas.
</regras>

## Seed

<regra critica="true">
Toda mudança no seed (`src/simulacao/dados/`) sobe `VERSAO_DOS_DADOS` em `src/simulacao/estado.ts` e atualiza o `RETRATO_DO_SEED` de `src/simulacao/estado.test.ts` no mesmo commit.

Sem subir a versão, quem já abriu o protótipo na aba continua no seed antigo, sem erro. Atualizar só o retrato também deixa o teste verde.
</regra>

<regras>
- Seed por assunto em `dados/<assunto>.ts`, com tipo `<Coisa>Simulada` exportado.
- Persona nova: `dados/personas.ts`. Personas do roteiro de testes separadas das demais.
- Datas do seed em instante ISO no fuso de Brasília; bordas de vigência testadas com a data simulada.
</regras>

## Decisões pendentes

<regras>
- Escolha de comportamento feita sem decisão do dono do produto: aplique a opção mais simples coerente com os requisitos e marque.
- Marcador: `// DECISAO-PENDENTE: <id-kebab-case>` na linha anterior ao código que aplica a escolha, em todos os pontos (contrato, tela, simulação).
- Registre a decisão no documento de decisões pendentes do projeto: id, pergunta, opção adotada, onde está no código. Id já registrado é atualizado, não duplicado.
- `grep -rn "DECISAO-PENDENTE" src` lista todos os pontos. Decisão tomada: aplicar, remover o marcador em todos os pontos e marcar como resolvida no registro.
</regras>

<exemplo>
```ts
// src/shared/contracts/pedidos.ts
// DECISAO-PENDENTE: prazo-do-pedido
export interface PrazoDoPedido {
  readonly venceEm: string;
}
````

</exemplo>
