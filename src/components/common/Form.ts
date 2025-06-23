import {Component} from "../base/Component";
import {IEvents} from "../base/events";
import {ensureElement} from "../../utils/utils";

interface IFormState {
    valid: boolean; // форма валидна или нет (true/false)
    errors: string | string[]; // массив ошибок (или одна строка позже)
}


// T — это обобщённый (generic) тип, например:


// interface OrderFormData {
//   email: string;
//   phone: string;
// }
// Тогда Form<OrderFormData> понимает, что у формы есть поля email и phone.

export class Form<T> extends Component<IFormState> {
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(protected container: HTMLFormElement, protected events: IEvents) {
        super(container);
        // сontainer — HTML-форма (<form>...</form>), с которой мы работаем.
        this._submit = ensureElement<HTMLButtonElement>('button', this.container);
        // Ищем кнопку отправки (<button type="submit">) в форме.Если её нет — ensureElement выбросит ошибку.
        this._errors = ensureElement<HTMLElement>('.form__errors', this.container); 
        // Ищем элемент, куда мы будем показывать ошибки
// для валидациии
// Слушаем ввод пользователя
        this.container.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const field = target.name as keyof T; //имя поля
            const value = target.value; //  введённое значение input на котором произошло событие
            //  создаем событие и сообщаем об этом эммитеру
            this.onInputChange(field, value); 
        });
        // Обработка отправки формы
        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(`${this.container.name}:submit`);
        });
    }

    protected onInputChange(field: keyof T, value: string) {
        // // Создаёт событие, например: order.email:change, и передаёт:
        // {
        //     field: 'email',
        //     value: 'test@example.com'
        //   }
        this.events.emit(`${this.container.name}.${String(field)}:change`, {
            field,
            value
        });
    }

    set valid(value: boolean) {
        this._submit.disabled = !value;
        // valid	Можно ли отправить форму? (true/false)
    }

    set errors(value: string) {
        this.setText(this._errors, value);
        // список ошибок (пустой или с текстом)
    }

    render(state: Partial<T> & IFormState) {
        const {valid, errors, ...inputs} = state;
        // Забираем valid и errors из объекта state
        // Причина : valid и errors — специальные поля
        // Они не связаны с самими полями формы, это техническое состояние формы:

        // Всё остальное (email, phone, и т.п.) попадает в объект inputs
        // Причина: Полей email, phone, password, name и т.п. может быть сколько угодно. 
        // Они описаны в типе T, но разные формы могут иметь разные поля.
        // Мы их копируем в this, чтобы:
        // иметь доступ к this.email, this.phone внутри класса;
        // передать значения в шаблон (если используется).

        // 👉 Это нужно, чтобы valid и errors передать отдельно, а все поля формы использовать позже.
        // valid — форма валидна?
        // errors — ошибки,
        // inputs — все остальные поля формы (email, phone и т.д.).
        super.render({valid, errors}); //Обновление состояния базового компонента 
        // То есть он просто копирует свойства (valid, errors) в текущий объект this и возвращает HTML-контейнер.
        // То есть просто копирует свойства valid и errors в текущий экземпляр (this).
        // Но сам метод Component.render(...) не работает с полями формы напрямую! 
        // Он просто копирует свойства — именно поэтому в Form продолжается работа ниже.
        Object.assign(this, inputs); //Установку остальных значений 
      
        // Копирование всех остальных полей формы
        return this.container;

    }
}


