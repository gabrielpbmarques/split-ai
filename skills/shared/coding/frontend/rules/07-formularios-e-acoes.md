# Formulários e ações

Escritas e erros de API: [`04-dados-do-servidor.md`](04-dados-do-servidor.md). Foco e anúncios: [`08-acessibilidade.md`](08-acessibilidade.md).

## Ações calculadas pelo servidor

<regra critica="true">
Ação sobre um recurso é `BotaoAcao` com `acao`, `acoes` e `bloqueios` vindos do recurso (`ComAcoes`). A tela não decide sozinha se a ação está habilitada, bloqueada ou oculta.

Regra de habilitação recalculada no cliente diverge do servidor: o botão aparece habilitado e a escrita é recusada, ou some quando a pessoa podia agir.
</regra>

<tabela>

| Situação no recurso   | `BotaoAcao` renderiza                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------- |
| `acao` em `acoes`     | Botão habilitado                                                                          |
| `acao` em `bloqueios` | Botão com `aria-disabled="true"`, focável, com o `motivo` na dica e no `aria-describedby` |
| ausente nos dois      | Nada                                                                                      |

</tabela>

<regras>
- `exibirMotivo`: `dica` (padrão), `texto` (motivo ao lado), `abaixo` (coluna de ações de tabela).
- `ocupado={mutacao.isPending}` enquanto a escrita da ação corre.
- `rotuloAcessivel` quando o texto visível não identifica o alvo: `Remover` → `Remover Ana Souza`.
- Motivo de bloqueio que vale para a tela inteira: `FaixaDeAviso tom="alerta" icone="atencao"` abaixo do cabeçalho, com os motivos de `situacaoDaAcao(acao, recurso)` sem repetição.
- Ação que não pertence a um recurso carregado (criar): `temPermissao(usePermissoesEfetivas(), PERMISSOES.<chave>)` mais a condição de estado que a API expõe. Ver [`09-autenticacao-e-permissoes.md`](09-autenticacao-e-permissoes.md).
- Proibido `Button disabled` com regra de negócio calculada na tela para ação de recurso.
</regras>

## Diálogos da tela

<regras>
- O componente que abre diálogos guarda um único estado `dialogo` de união discriminada: `type Dialogo = { tipo: 'aprovar' } | { tipo: 'editar'; pedido: DetalhePedido }`, `useState<Dialogo | null>(null)`.
- `abrir(novo)` chama `reset()` das mutações envolvidas e depois `setDialogo(novo)`. `fechar()` faz `setDialogo(null)`.
- Diálogo com estado de formulário monta só aberto: `{dialogo?.tipo === 'editar' ? <EditarPedidoDialog … /> : null}`, com `open` fixo dentro dele.
- `onOpenChange` ignora o fechamento enquanto a escrita corre: `if (!aberto && !mutacao.isPending) fechar();`. Em `Dialog`, também `fecharAoClicarFora={!ocupado}`.
- O diálogo recebe do pai: estado da escrita (`criando`, `salvando`, `confirmando`), `erro: string | null` e o callback (`onCriar`, `onSalvar`, `onConfirmar`). O pai chama `mutate(dados, { onSuccess })`.
- Recusa do servidor mantém o diálogo aberto, com o que a pessoa digitou, e mostra a mensagem em `FaixaDeAviso tom="erro" icone="erro" anuncio="alert"` no topo do conteúdo.
</regras>

## Confirmação

<regras>
- Ação sem dado a informar e com consequência: `ConfirmacaoDialog`.
- `titulo`: pergunta com o objeto (`Aprovar o pedido P-001?`, `Desativar a conta de Ana Souza?`). `textoConfirmar`: o verbo da ação (`Aprovar pedido`), nunca `OK` ou `Sim`.
- Conteúdo: uma ou duas frases sobre a consequência, e o erro da escrita acima delas.
- `tom`: `padrao`; `atencao` para ação reversível com impacto em outra pessoa; `destrutivo` para ação irreversível (foco inicial em "Cancelar").
- `tomDoConfirmar="perigo"` para remover, desativar, cancelar ou recusar.
- `confirmando={mutacao.isPending}`.
</regras>

## Ação com justificativa

<regras>
- Escrita que exige justificativa usa `DialogoDeAcao` de `@/shared-domain/justificativas`. Proibido campo de justificativa próprio.
- Props: `acao` (título), `resumo` (o que muda, com o objeto em `<strong>`), `textoConfirmar`, `campo` opcional (dado da ação acima da justificativa), `executar(api, justificativa)`, `mensagemDeSucesso`, `onConcluir`, `onCancelar`.
- `executar` recebe a função de `api.ts` com o corpo montado: `(api, justificativa) => cancelarPedido(api, pedido.id, { justificativa })`.
- `DialogoDeAcao` valida com `validarJustificativa` (mesma regra do servidor), executa, relê o mundo, mostra o toast e chama `onConcluir`. Recusa do servidor fica no diálogo.
</regras>

## Formulário

<regras>
- Formulário de criação ou edição fica em `Dialog` (ponte) ou em `Section` da página. O componente do formulário vive em `components/` (`NovoPedidoDialog`, `EditarPedidoDialog`).
- `<form id={idDoFormulario} noValidate onSubmit={enviar}>`; o botão de envio fica no `footer` do `Dialog` com `type="submit" form={idDoFormulario}`.
- Ids de campo com `useId()`. Proibido id fixo em componente reutilizável.
- Estado de cada campo em `useState`, com valor inicial vindo das props. Edição envia só o que mudou.
- Validação local (obrigatório, formato, tamanho) roda no envio. Erro aparece depois da primeira tentativa de envio (`envios > 0`) e some quando o campo fica válido.
- Envio inválido: não chama o callback e move o foco ao primeiro campo com erro depois do render (`useRef` + `useEffect` sem dependências).
- Regra de negócio é validada pelo servidor. A tela não duplica regra que depende de outro recurso.
- Recusa com `details`: o pai passa `falhaDaEscrita(mutacao.error, generica)`; o diálogo mostra `falha.erros[campo]` em cada campo e `falha.mensagem` na faixa quando nenhum campo conhecido veio.
- Botão de envio: `disabled={ocupado}` e `aria-busy={ocupado || undefined}`. Botão "Cancelar": `ButtonVariante tom="neutro"`, `disabled={ocupado}`.
- `Seletor`: `rotulo`, `obrigatorio`, `placeholder`, `erro`. `Input`, `InputCompacto`, `TextArea`: `label`, `required`, `maxLength`, `validation="error"` com erro, `aria-invalid` e `aria-describedby` apontando para a mensagem.
- Campo com `label` do DS mostra "(opcional)" quando não é `required`. Campo obrigatório: `required`. Campo que sempre tem valor (filtro, seletor com padrão): `showOptionalText={false}`.
- `maxLength` do campo igual ao limite do contrato.
- Texto enviado passa por `trim()`. Campo opcional vazio não vai no corpo (função `corpoDo<Coisa>` de `api.ts`).
- Data de calendário: campo de data (`AAAA-MM-DD`) convertido por `instanteDoInicioDoDia` / `instanteDepoisDoDia` em `api.ts`.
</regras>

<exemplo>
```ts
// src/shared/contracts/pedidos.ts
export interface CorpoDoNovoPedido {
  readonly codigo: string;
  readonly observacao?: string;
}
```

```ts
// src/pages/pedidos/types.ts
export interface NovoPedido {
  readonly codigo: string;
  readonly observacao: string;
}
```

```ts
// src/pages/pedidos/api.ts
export function corpoDoNovoPedido({
  codigo,
  observacao,
}: NovoPedido): CorpoDoNovoPedido {
  return { codigo, ...(observacao === '' ? {} : { observacao }) };
}

export function criarPedido(
  api: ApiClient,
  novo: NovoPedido,
): Promise<DetalhePedido> {
  return api<DetalhePedido>('pedidos', {
    method: 'POST',
    body: corpoDoNovoPedido(novo),
  });
}
```

```ts
// src/pages/pedidos/hooks.ts
export function useCriarPedido() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (novo: NovoPedido) => criarPedido(api, novo),
    onSuccess: () => atualizarConsultasDepoisDaEscrita(queryClient),
  });
}
```

```tsx
// src/pages/pedidos/components/NovoPedidoDialog.tsx
import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  Button,
  ButtonVariante,
  Dialog,
  FaixaDeAviso,
  InputCompacto,
  TextArea,
} from '@/shared/ui';
import type { NovoPedido } from '../types';

const CODIGO_MAXIMO = 60;
const OBSERVACAO_MAXIMA = 1000;

interface CampoComMensagemProps {
  id: string;
  erro?: string;
  children: ReactNode;
}

function CampoComMensagem({ id, erro, children }: CampoComMensagemProps) {
  return (
    <div className="flex flex-col gap-2">
      {children}
      {erro ? (
        <p id={id} className="text-body-sm text-error-600">
          {erro}
        </p>
      ) : null}
    </div>
  );
}

interface NovoPedidoDialogProps {
  criando: boolean;
  erro: string | null;
  onCriar: (novo: NovoPedido) => void;
  onFechar: () => void;
}

export function NovoPedidoDialog({
  criando,
  erro,
  onCriar,
  onFechar,
}: NovoPedidoDialogProps) {
  const idDoFormulario = useId();
  const idDoCodigo = useId();
  const idDaObservacao = useId();
  const [codigo, setCodigo] = useState('');
  const [observacao, setObservacao] = useState('');
  const [envios, setEnvios] = useState(0);
  const focarDepois = useRef<string | null>(null);

  useEffect(() => {
    const id = focarDepois.current;
    if (id === null) return;
    focarDepois.current = null;
    document.getElementById(id)?.focus();
  });

  const erroDoCodigo =
    envios > 0 && codigo.trim() === ''
      ? 'Informe o código do pedido.'
      : undefined;

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    setEnvios((atual) => atual + 1);
    if (codigo.trim() === '') {
      focarDepois.current = idDoCodigo;
      return;
    }
    onCriar({ codigo: codigo.trim(), observacao: observacao.trim() });
  }

  return (
    <Dialog
      open
      tamanho="compacto"
      title="Novo pedido"
      fecharAoClicarFora={!criando}
      onOpenChange={(aberto) => {
        if (!aberto && !criando) onFechar();
      }}
      footer={
        <>
          <ButtonVariante
            type="button"
            tom="neutro"
            disabled={criando}
            onClick={onFechar}
          >
            Cancelar
          </ButtonVariante>
          <Button
            type="submit"
            form={idDoFormulario}
            disabled={criando}
            aria-busy={criando || undefined}
          >
            Criar pedido
          </Button>
        </>
      }
    >
      <form
        id={idDoFormulario}
        noValidate
        className="relative flex flex-col gap-4"
        onSubmit={enviar}
      >
        {erro ? (
          <FaixaDeAviso tom="erro" icone="erro" anuncio="alert">
            {erro}
          </FaixaDeAviso>
        ) : null}
        <CampoComMensagem id={`${idDoCodigo}-mensagem`} erro={erroDoCodigo}>
          <InputCompacto
            id={idDoCodigo}
            label="Código"
            required
            maxLength={CODIGO_MAXIMO}
            value={codigo}
            validation={erroDoCodigo ? 'error' : undefined}
            aria-invalid={erroDoCodigo ? true : undefined}
            aria-describedby={
              erroDoCodigo ? `${idDoCodigo}-mensagem` : undefined
            }
            onChange={(evento) => setCodigo(evento.target.value)}
          />
        </CampoComMensagem>
        <TextArea
          id={idDaObservacao}
          label="Observação"
          maxLength={OBSERVACAO_MAXIMA}
          value={observacao}
          onChange={(evento) => setObservacao(evento.target.value)}
        />
      </form>
    </Dialog>
  );
}
```

</exemplo>

Consumo:

<exemplo>
```tsx
// src/pages/pedidos/Pedidos.tsx
const criacao = useCriarPedido();
const [criando, setCriando] = useState(false);

{criando ? (
<NovoPedidoDialog
criando={criacao.isPending}
erro={criacao.isError ? mensagemDaEscrita(criacao.error, 'Não foi possível criar o pedido.') : null}
onCriar={(novo) =>
criacao.mutate(novo, {
onSuccess: (pedido) => {
toast.success('Pedido criado.');
setCriando(false);
abrir(pedido.id);
},
})
}
onFechar={() => setCriando(false)}
/>
) : null}

```
</exemplo>

## Avisos e retorno da ação

<tabela>

| Situação | Use |
| --- | --- |
| Escrita concluída | `toast.success('<Coisa> <particípio>.')`: `Pedido aprovado.`, `Perfil atribuído.` |
| Escrita recusada dentro de diálogo | `FaixaDeAviso tom="erro" icone="erro" anuncio="alert"` no diálogo |
| Escrita recusada sem diálogo (ação direta na linha) | `toast.danger(mensagem)` quando `mensagemDaEscrita(erro)` não é `null` |
| Estado da tela que a pessoa precisa saber (prazo, bloqueio, conclusão) | `FaixaDeAviso` com `tom` e `icone`, abaixo do cabeçalho |
| Ação simulada no protótipo (exportação) | `toast.success` descrevendo o que seria gerado |

</tabela>

<regras>
- Texto do toast: frase curta no passado, com ponto final.
- Proibido `alert()`, `confirm()` e `prompt()` do navegador.
- Proibido toast de erro para 403: a casca já avisou.
</regras>
```
