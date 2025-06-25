import { Component } from "../base/Component";
import { IEvents } from "../base/events";
import { ensureAllElements, ensureElement } from "../../utils/utils";
import { TBuyerInfo, TBuyerContacts } from "../../types";
import { TPayment } from "../../types";
interface IFormState{
  valid: boolean; // форма валидна или нет (true/false)
  errors: string[]; // массив ошибок (или одна строка позже)
  
}





abstract class Form<T extends object> extends Component<IFormState> {
  protected _submit: HTMLButtonElement;
  protected _errors: HTMLElement;
  // переопределим тип как HTMLFormElement
  protected override container: HTMLFormElement; 

  constructor(container: HTMLFormElement, protected events: IEvents) {
    super(container);
    this.container = container; // снова его инициализируем
    this._submit = ensureElement<HTMLButtonElement>('.button-submit', this.container);
    this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

    this.container.addEventListener('input', (e:Event)=>{
      const target = e.target as HTMLInputElement; 
      const field =target.name as keyof T; //имя поля
      const value =target.value   //введённое значение input на котором произошло событие
       //  создаем событие и сообщаем об этом эммитеру
      //   что данные поляпоменялись
       this.onInputChange(field, value); 
    });

      // Обработка отправки формы
      this.container.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        // Создаем событие  напр 'order:submit',
        // где order это название формы
        this.events.emit(`${this.container.name as string}:submit`);
    });
  }
  protected onInputChange(field: keyof T, value: string) {
    // // Создаёт событие, например: order.email:change, и передаёт:
    // {
    //     field: 'email',
    //     value: 'test@example.com'
    //   }
    this.events.emit(`${this.container.name as string}.${String(field)}:change`, {
        field,
        value
    });
  }

  set valid(value: boolean) { // блокировать кнопку или нет
    this._submit.disabled = !value;
    // valid	Можно ли отправить форму? (true/false)
  }

  set errors(value: string) {
    this.setText(this._errors, value);
    // список ошибок (пустой или с текстом)
  }
  clear(): void {
   
    this.container.reset();
  }

  render(state: Partial<T> &  IFormState) {
    // разделяем ответственность
      const {valid,errors, ...inputs} = state;
      // родителю передаем стандартные данные
      super.render({valid,errors})
      // здесь обрабатваем текущие поля формы
      Object.assign(this,inputs)

      return this.container
  }   

}


export  class FormOrder extends Form<TBuyerInfo> {
    protected _paymentButtons:  HTMLElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this._paymentButtons = ensureElement<HTMLElement>('.order__buttons', this.container);
        this._paymentButtons.addEventListener('click', (e: Event) => {
          const target = e.target as HTMLInputElement;
          // делегирование событий
          if(target instanceof HTMLButtonElement && (target.name === 'card' || target.name === 'cash')) {

            const buttons =ensureAllElements<HTMLButtonElement>('.button',this._paymentButtons)
            // убираем класс у всех кнопок:
            buttons.forEach((btn)=>{ this.toggleClass(btn, 'button_active',false);})
            // выделяем только кликнутую кнопку
            this.toggleClass(target, 'button_active',true);
            // сообщаем об этом, чтобы потом дополнить заказ данными адреса и способа оплаты
            this.onInputChange(`payment`, target.name);
            
            
          }
        })
    }
// Автозаполнение адреса и платежного способа
    set address(value: string) {
      (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

    set payment(value: TPayment) {
      // находим нужную кнопку по имени
      const button = this.container.elements.namedItem(value) as HTMLButtonElement;
      //  выделяем кнопку
      this.toggleClass(button, 'button_active',true);
     
    }
}

export  class FormContacts extends Form<TBuyerContacts> {

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);
}
// Автозаполнение телефона и почты
  set phone(value: string) {
    (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
  }

  set email(value:string) {
    (this.container.elements.namedItem('email') as HTMLInputElement).value =value
  }

  
}