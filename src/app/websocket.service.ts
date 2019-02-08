import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() { }
  websocket(url){
    return new RxWebsocket(url) 
  }

}

export class RxWebsocket {
  private ws: WebSocket;
  // close:(code?: number, reason?: string) => void;
  constructor(private url: string){
    this.ws = new WebSocket(url)
    this.ws.onerror = e => this.errorSubject.next(e);
    this.ws.onclose = e => this.closeSubject.next(e);
    this.ws.onmessage = e => this.messageSubject.next(e);
    this.ws.onopen = e => this.openSubject.next(e);
    // this.close = ;
  }

  close(code?: number, reason?: string) {
    this.ws.close(code, reason);
  }

  private errorSubject = new Subject<Event>();
  private closeSubject = new Subject<CloseEvent>();
  private messageSubject = new Subject<MessageEvent>();
  private openSubject = new Subject<Event>();
    
  onError: Observable<Event> = this.errorSubject
  onClose: Observable<CloseEvent>  = this.closeSubject
  onMessage: Observable<MessageEvent>  = this.messageSubject
  onOpen: Observable<Event>  = this.openSubject
  
  readyState(){
    return this.ws.readyState
  }

  send(msg: string){
    this.ws.send(msg);
  }

}
