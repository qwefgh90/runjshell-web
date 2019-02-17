import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import { ResizeEvent } from 'angular-resizable-element';
import { Subject } from 'rxjs';
import { WebsocketService, RxWebsocket } from './websocket.service';
import { environment } from 'src/environments/environment';
import { Message } from './model/message';

export const minTermWidth = 100;
export const minTermHeight = 100;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked {
  title = 'Online JShell';
  keyInput: Subject<string> = new Subject<string>();
  term: Terminal;
  h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  style: object = { height: (this.h / 2) + 'px' };
  initBanner = 'Welcome RunJShell!'
  ws: RxWebsocket;
  constructor(private websocketService: WebsocketService){

  }

  /**
   * When a dimension of div changes, fit a terminal in div.
   */
  ngAfterViewChecked() {
    fit.fit(this.term);
  }

  /**
   * It creates new terminal in #terminal.
   */
  ngOnInit() {
    Terminal.applyAddon(fit);  // Apply the `fit` addon   
    this.term = new Terminal();
    this.term.open(document.getElementById('terminal'));
    this.term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
    this.term.on('data', (input) => {
      this.keyInput.next(input);
      // console.log(input);
    })
    this.term.on('key', (key, event) => {
    })
    this.connectWithTerminal(this.connect(environment.backend), this.term, this.keyInput);
  }

  connectWithTerminal(ws: RxWebsocket, term: Terminal, keyInput: Subject<String>){
    //this.ws = this.connect(environment.backend);
    ws.onOpen.subscribe(e => {
      if (ws.readyState() == WebSocket.OPEN) {
        this.keyInput.subscribe(input => {
          ws.send(input);
        })
        ws.onMessage.subscribe(e => {
          let msg = JSON.parse(e.data) as Message
          if(msg.type == 'print'){
            term.write(msg.msg);
          }
        })
      }
    });
    this.ws = ws;
  }

  /**
   * After user coordinate a size of terminal, it's called.
   * @param left 
   * @param top 
   * @param width 
   * @param height 
   */
  onResizeEnd(left: number, top: number, width: number, height: number): void {
    this.style['left'] = `${left}px`;
    this.style['top'] = `${top}px`;
    this.style['width'] = `${width}px`;
    this.style['height'] = `${height}px`;
  }
  /**
   * Before onResizeEnd is called, it valiates a size to change.
   * @param re dimension to be submitted from resizable stuff
   */
  validate(re: ResizeEvent){
    let left = re.rectangle.left, top = re.rectangle.top, width = re.rectangle.width, height = re.rectangle.height;
    if((width < minTermWidth) || (height < minTermHeight)){
      return false;
    }else return true;
  }

  connect(url: string): RxWebsocket{
    return this.websocketService.websocket(url);
  }
}
