import {Component} from './base/Component';
import {ensureElement} from '../utils/utils';

interface ISuccess {
  totalPrice:number;
}


interface ISuccessActions {
  onClick: ()=>void;
}

export class Success extends Component<ISuccess>{
  protected _totalPrice:HTMLElement;
  protected _button:HTMLElement;
  constructor(container:HTMLElement,actions?:ISuccessActions){
      super(container;)
      this._totalPrice = ensureElement('.order-success__description',container) as HTMLElement;
      this._button = ensureElement('.order-success__close',container) as HTMLElement;

      if(actions.onClick && this._button){
        this._button.addEventListener('click',actions.onClick);
      }

  }

  set totalPrice(value:number) {
    this.setText(this._totalPrice, value);
  }
}