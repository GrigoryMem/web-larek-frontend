import {IEvents} from "./events";
import {EventEmitter} from "./events";
//  отображения  

export interface IViewConstructor {  // (интерфейсконструктора -для презентера)
    new (container:HTMLElement,events?:EventEmitter):IView  // на входе контейнер в него будем выводить
  }
// интерфейс  класса отображения 
export interface IView {
    render(data?: object): HTMLElement // устанавливаем данные,вовзращаем контейнер HTMLElement c заполненными данными
  }
// Component — базовый класс для интерфейса
/**
 * Базовый компонент - взято из проекта ОНО - позв создавать и работать с вертской
 */
export abstract class Component<T>  implements IView {
    protected constructor(protected readonly container: HTMLElement) {
        // Учитывайте что код в конструкторе исполняется ДО всех объявлений в дочернем классе
    }

    // Инструментарий для работы с DOM в дочерних компонентах

    // Переключить класс
    toggleClass(element: HTMLElement, className: string, force?: boolean) {
        element.classList.toggle(className, force);
    }

    // Установить текстовое содержимое
    protected setText(element: HTMLElement, value: unknown) {
        if (element) {
            element.textContent = String(value);
        }
    }

    // Сменить статус блокировки
    setDisabled(element: HTMLElement, state: boolean) {
        if (element) {
            if (state) element.setAttribute('disabled', 'disabled');
            else element.removeAttribute('disabled');
        }
    }

    // Скрыть
    protected setHidden(element: HTMLElement) {
        element.style.display = 'none';
    }

    // Показать
    protected setVisible(element: HTMLElement) {
        element.style.removeProperty('display');
    }

    // Установить изображение с алтернативным текстом
    protected setImage(element: HTMLImageElement, src: string, alt?: string) {
        if (element) {
            element.src = src;
            if (alt) {
                element.alt = alt;
            }
        }
    }

    // Вернуть корневой DOM-элемент
    render(data?: Partial<T>): HTMLElement {
        Object.assign(this as object, data ?? {});
        return this.container;
    }
}
