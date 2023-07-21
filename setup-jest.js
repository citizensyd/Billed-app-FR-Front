// Import jQuery and make it available globally for your tests
import $ from 'jquery';
global.$ = global.jQuery = $;

// Mock the modal method
$.fn.modal = jest.fn();