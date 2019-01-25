import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import { ResizeEvent } from 'angular-resizable-element';

export const minTermWidth = 100;
export const minTermHeight = 100;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked {
  title = 'Online JShell';
  term: Terminal;
  h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  style: object = { height: (this.h / 2) + 'px' };

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
}
