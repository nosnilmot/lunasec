import wrapComponent from "./components/wrapComponent";
import Span from './components/elements/span'

export * from './components/SecureForm';
export * from './components/SecureFormContext';
export * from './components/SecureInput';
export * from './components/SecureSubmit';

export const SecureSpan = wrapComponent(Span, 'span')