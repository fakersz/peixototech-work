# Peixoto Tech · Escritório Virtual

Um escritório 3D com interface clara, barra flutuante e Jean como CEO. Three.js, JavaScript ES modules e Vite; sem backend ou serviços externos.

## Executar

Requer Node.js 20.19+ ou 22.12+ com npm e navegador com WebGL 2.

```sh
npm install
npm run dev
```

Abra **http://127.0.0.1:5173/**. A porta é fixa. Depois da instalação das dependências, funciona sem internet com o servidor local ativo.

```sh
npm test
npm run build
npm run preview
```

O build fica em `dist/`. O preview usa **http://127.0.0.1:4173/**. Não abra o HTML diretamente via `file://`.

Neste ambiente, Node/npm não estavam disponíveis no PATH do shell. Foi usado o runtime do Codex. Se seu terminal não reconhecer npm, instale Node.js com npm. Alternativa específica para este ambiente:

```sh
npm run dev
```

## Jean, CEO

Jean é um personagem estilizado feito com geometrias nativas: roupa azul, cabelo escuro, barba e óculos. É uma representação inicial, sem modelo personalizado a partir de fotografia.

- Clique no chão para fazê-lo caminhar até o ponto indicado, com animação de braços e pernas.
- Use WASD ou setas após clicar na sala. O movimento acompanha a direção da câmera.
- Clique no Jean ou no botão **Acenar** para cumprimentar e interromper a caminhada.
- **Voltar à mesa** faz Jean caminhar de volta à posição inicial ao lado da mesa.
- O personagem permanece dentro das bordas do piso, com margem para seu corpo.
- A etiqueta Jean / CEO acompanha sua posição; o cartão mostra o estado real de caminhada, aceno ou repouso.
- No celular: toque para caminhar; um dedo arrasta a câmera; dois dedos deslocam ou aproximam.

Não há seleção, hover ou inspector de blocos. Cada quadrado serve apenas como referência de 1 m². O botão de grade mostra ou oculta os contornos do piso.

## Câmera

| Ação | Controle |
| --- | --- |
| Orbitar pelo lado aberto | Esquerdo + arrastar |
| Deslocar | Direito + arrastar |
| Aproximar / afastar | Scroll ou central + arrastar |
| Visão inicial | Escritório, na barra flutuante |
| Outros ângulos | Superior e Frontal |
| Centralizar câmera | Botão de mira |

Clique e arraste têm comportamentos distintos: girar a câmera não envia Jean para outro lugar. O pan e o zoom são limitados à região do escritório; a câmera permanece acima do chão e fora da sala. A órbita horizontal fica voltada aos lados abertos, evitando enquadramentos por trás das paredes. A visão frontal tem leve elevação para preservar a leitura do piso. O afastamento dos presets se adapta às telas estreitas.

## Ambiente

1 unidade = 1 metro. Sala de 3 × 3 m, com nove pisos independentes `BoxGeometry` de 1 × 0,12 × 1 m. A superfície está em Y = 0. Duas paredes com 3 m de comprimento, **1,45 m de altura** e 0,12 m de espessura abrem a visão do personagem. Sem teto. Mesa executiva com monitor, teclado, caderno e caneca; cadeira do CEO, poltrona de visitante e planta decorativa. Piso mais claro com plataforma elevada e contornos discretos. Paredes com arremate superior, canto fechado, rodapé azul, janela estilizada e placa Peixoto Tech.

A cena usa sombras suaves, materiais/geometrias compartilhados, pixel ratio limitado a 2, requestAnimationFrame e descarte de recursos/listeners. Vite usa polling para evitar dependência de fsevents nativo no runtime gerenciado; Three.js é servido como ES modules no desenvolvimento.

## Estrutura

```text
index.html                         Barra, cartão do CEO e dicas
package.json / package-lock.json    Dependências e comandos
vite.config.js                     Configuração local
src/main.js                        Cena, eventos, loop e descarte
src/scene/createScene.js            Renderer, câmera e fundo
src/scene/createFloor.js            Piso e medidas visuais
src/scene/createWalls.js            Paredes baixas e acabamento azul
src/scene/createLighting.js         Iluminação e sombras
src/scene/createFurniture.js        Mobília e áreas de colisão
src/scene/createOfficeSign.js       Placa da empresa gerada localmente
src/characters/createJean.js        Modelo, caminhada e aceno
src/controls/cameraControls.js      Câmera, presets e limites
src/interaction/officeInteraction.js Clique, teclado e etiqueta do CEO
src/interaction/roomNavigation.js   Rotas e colisão com a mobília
src/styles/style.css               Interface responsiva
tests/jean.test.js                  Testes de movimento e limites
tests/navigation.test.js            Colisão e rotas no escritório
```

Sem agentes de IA, autenticação, banco de dados ou integrações. A caminhada por clique encontra um caminho livre em uma grade interna e suaviza a rota; WASD/setas respeitam os móveis e permitem deslizar pelas bordas. Essa grade não é exibida na interface. As colisões são aproximações retangulares com margem para o personagem. Novos móveis precisam cadastrar sua área ocupada.

## Verificação

- `npm test`: seis testes verificam destino, limites da sala, teclado, aceno, retorno à posição inicial, altura das paredes, rotas em torno dos móveis e bloqueio de movimento contra a mesa.
- `npm run build`: concluído. O aviso de tamanho do bundle corresponde principalmente ao renderer Three.js.
- Playwright no Chrome instalado: renderização, ausência do inspector, etiqueta do CEO, aceno, clique para caminhar, teclado, retorno ao centro, arraste sem caminhada, botão de medidas e layout em 1440 × 1000 e 390 × 844. Sem erros de console nesses testes.
- Ainda não avaliados manualmente: Safari, trackpad, dispositivos reais de toque e consumo/FPS da GPU.

## Refinamento visual

A base modular, o Jean, as ações por clique/teclado, o aceno e os controles de câmera foram preservados. A composição usa agora uma perspectiva mais próxima e elevada, paleta gelo/off-white e azul, mobília proporcional à sala de 3 × 3 m, animações com transição suave e HUD mais leve. Não foram adicionados departamentos, backend ou agentes.

Próximo passo sugerido: permitir que Jean se aproxime da cadeira, sente e levante, com uma interação simples na mesa, antes de ampliar a empresa.
