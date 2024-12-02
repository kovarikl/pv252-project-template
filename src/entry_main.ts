import {
  allComponents,
  provideFluentDesignSystem,
} from "@fluentui/web-components";
import { SocketCanvasElement } from "./socket_canvas.js";
// Make everything use microsoft fluent by default.
provideFluentDesignSystem().register(allComponents);

/* 

Useful types (you don't have to use them explicitly, 
they serve as documentation for what the protocol is doing) 

*/

interface Point {
  x: number;
  y: number;
}

interface WelcomeMessage {
  // The size of the remote canvas.
  x: number;
  y: number;
  data: [number];
}

interface UpdateMessage {
  point: Point;
  value: boolean;
}

document.body.style.cursor = "crosshair";
let messageCounter = 0;
let draw = true;
let newCanvas: SocketCanvasElement | null = null;

// Create a websocket connection.
// More info at https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
const socket = new WebSocket("ws:socket.zavazadlo.unsigned-short.com");

socket.onmessage = (m) => {
  const data = JSON.parse(m.data);

  if (messageCounter === 0) {
    const welcomeMessage = data as WelcomeMessage;

    newCanvas = new SocketCanvasElement();
    newCanvas.width = welcomeMessage.x;
    newCanvas.height = welcomeMessage.y;

    setTimeout(() => {
      for (let x = 0; x < welcomeMessage.x; x++) {
        for (let y = 0; y < welcomeMessage.y; y++) {
          newCanvas!.setPixel(
            x,
            y,
            welcomeMessage.data[y + x * welcomeMessage.y] === 1,
          );
        }
      }
    });

    newCanvas.ondraw = (x, y) => {
      newCanvas!.setPixel(x, y, draw);
      const updateMessage: UpdateMessage = {
        point: { x, y },
        value: draw,
      };
      socket.send(JSON.stringify(updateMessage));
    };

    document.querySelector("#container")!.appendChild(newCanvas);

    setInterval(() => {
      const updateMessage: UpdateMessage = {
        point: { x: 0, y: 0 },
        value: false,
      };
      socket.send(JSON.stringify(updateMessage));
    }, 100);
  } else {
    if (Array.isArray(data)) {
      for (const updateData of data) {
        const update = updateData as UpdateMessage;
        newCanvas!.setPixel(update.point.x, update.point.y, update.value);
      }
    }
  }

  messageCounter++;
};

window.addEventListener("keydown", (e) => {
  if (e.key === "r") {
    draw = !draw;
    document.body.style.cursor =
      document.body.style.cursor === "crosshair" ? "pointer" : "crosshair";
  }
});
