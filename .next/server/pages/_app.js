/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./pages/_app.jsx":
/*!************************!*\
  !*** ./pages/_app.jsx ***!
  \************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _src_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../src/styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _src_styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_src_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var wagmi__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! wagmi */ \"wagmi\");\n/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tanstack/react-query */ \"@tanstack/react-query\");\n/* harmony import */ var _src_utils_wallet__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../src/utils/wallet */ \"./src/utils/wallet.js\");\n/* harmony import */ var react_hot_toast__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-hot-toast */ \"react-hot-toast\");\n/* harmony import */ var next_dynamic__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/dynamic */ \"./node_modules/next/dynamic.js\");\n/* harmony import */ var next_dynamic__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_dynamic__WEBPACK_IMPORTED_MODULE_6__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([wagmi__WEBPACK_IMPORTED_MODULE_2__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__, _src_utils_wallet__WEBPACK_IMPORTED_MODULE_4__, react_hot_toast__WEBPACK_IMPORTED_MODULE_5__]);\n([wagmi__WEBPACK_IMPORTED_MODULE_2__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__, _src_utils_wallet__WEBPACK_IMPORTED_MODULE_4__, react_hot_toast__WEBPACK_IMPORTED_MODULE_5__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n\n\nconst queryClient = new _tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__.QueryClient();\n// Dynamically import Layout with ssr: false\nconst DynamicLayout = next_dynamic__WEBPACK_IMPORTED_MODULE_6___default()(()=>Promise.all(/*! import() */[__webpack_require__.e(\"vendor-chunks/next\"), __webpack_require__.e(\"vendor-chunks/@swc\"), __webpack_require__.e(\"vendor-chunks/react-icons\"), __webpack_require__.e(\"src_components_Layout_jsx\")]).then(__webpack_require__.bind(__webpack_require__, /*! ../src/components/Layout */ \"./src/components/Layout.jsx\")), {\n    loadableGenerated: {\n        modules: [\n            \"pages\\\\_app.jsx -> \" + \"../src/components/Layout\"\n        ]\n    },\n    ssr: false\n});\nfunction MyApp({ Component, pageProps }) {\n    // All Wagmi hooks and handleConnectWallet are now handled within DynamicLayout\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(wagmi__WEBPACK_IMPORTED_MODULE_2__.WagmiProvider, {\n        config: _src_utils_wallet__WEBPACK_IMPORTED_MODULE_4__.config,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__.QueryClientProvider, {\n            client: queryClient,\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(DynamicLayout, {\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                        ...pageProps\n                    }, void 0, false, {\n                        fileName: \"D:\\\\Github\\\\darknodedex\\\\pages\\\\_app.jsx\",\n                        lineNumber: 19,\n                        columnNumber: 11\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"D:\\\\Github\\\\darknodedex\\\\pages\\\\_app.jsx\",\n                    lineNumber: 18,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_hot_toast__WEBPACK_IMPORTED_MODULE_5__.Toaster, {}, void 0, false, {\n                    fileName: \"D:\\\\Github\\\\darknodedex\\\\pages\\\\_app.jsx\",\n                    lineNumber: 21,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"D:\\\\Github\\\\darknodedex\\\\pages\\\\_app.jsx\",\n            lineNumber: 17,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"D:\\\\Github\\\\darknodedex\\\\pages\\\\_app.jsx\",\n        lineNumber: 16,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBbUM7QUFDRztBQUNtQztBQUM1QjtBQUNIO0FBQ1A7QUFFbkMsTUFBTU0sY0FBYyxJQUFJTCw4REFBV0E7QUFFbkMsNENBQTRDO0FBQzVDLE1BQU1NLGdCQUFnQkYsbURBQU9BLENBQUMsSUFBTSxpVkFBTzs7Ozs7O0lBQStCRyxLQUFLOztBQUUvRSxTQUFTQyxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFFO0lBQ3JDLCtFQUErRTtJQUMvRSxxQkFDRSw4REFBQ1gsZ0RBQWFBO1FBQUNHLFFBQVFBLHFEQUFNQTtrQkFDM0IsNEVBQUNELHNFQUFtQkE7WUFBQ1UsUUFBUU47OzhCQUMzQiw4REFBQ0M7OEJBQ0MsNEVBQUNHO3dCQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7OzhCQUUxQiw4REFBQ1Asb0RBQU9BOzs7Ozs7Ozs7Ozs7Ozs7O0FBSWhCO0FBRUEsaUVBQWVLLEtBQUtBLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kYXJrbm9kZS1kZXgvLi9wYWdlcy9fYXBwLmpzeD80Y2IzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi4vc3JjL3N0eWxlcy9nbG9iYWxzLmNzcyc7XHJcbmltcG9ydCB7IFdhZ21pUHJvdmlkZXIgfSBmcm9tICd3YWdtaSc7XHJcbmltcG9ydCB7IFF1ZXJ5Q2xpZW50LCBRdWVyeUNsaWVudFByb3ZpZGVyIH0gZnJvbSAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5JztcclxuaW1wb3J0IHsgY29uZmlnIH0gZnJvbSAnLi4vc3JjL3V0aWxzL3dhbGxldCc7XHJcbmltcG9ydCB7IFRvYXN0ZXIgfSBmcm9tICdyZWFjdC1ob3QtdG9hc3QnO1xyXG5pbXBvcnQgZHluYW1pYyBmcm9tICduZXh0L2R5bmFtaWMnO1xyXG5cclxuY29uc3QgcXVlcnlDbGllbnQgPSBuZXcgUXVlcnlDbGllbnQoKTtcclxuXHJcbi8vIER5bmFtaWNhbGx5IGltcG9ydCBMYXlvdXQgd2l0aCBzc3I6IGZhbHNlXHJcbmNvbnN0IER5bmFtaWNMYXlvdXQgPSBkeW5hbWljKCgpID0+IGltcG9ydCgnLi4vc3JjL2NvbXBvbmVudHMvTGF5b3V0JyksIHsgc3NyOiBmYWxzZSB9KTtcclxuXHJcbmZ1bmN0aW9uIE15QXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfSkge1xyXG4gIC8vIEFsbCBXYWdtaSBob29rcyBhbmQgaGFuZGxlQ29ubmVjdFdhbGxldCBhcmUgbm93IGhhbmRsZWQgd2l0aGluIER5bmFtaWNMYXlvdXRcclxuICByZXR1cm4gKFxyXG4gICAgPFdhZ21pUHJvdmlkZXIgY29uZmlnPXtjb25maWd9PlxyXG4gICAgICA8UXVlcnlDbGllbnRQcm92aWRlciBjbGllbnQ9e3F1ZXJ5Q2xpZW50fT5cclxuICAgICAgICA8RHluYW1pY0xheW91dD5cclxuICAgICAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cclxuICAgICAgICA8L0R5bmFtaWNMYXlvdXQ+XHJcbiAgICAgICAgPFRvYXN0ZXIgLz5cclxuICAgICAgPC9RdWVyeUNsaWVudFByb3ZpZGVyPlxyXG4gICAgPC9XYWdtaVByb3ZpZGVyPlxyXG4gICk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE15QXBwOyAiXSwibmFtZXMiOlsiV2FnbWlQcm92aWRlciIsIlF1ZXJ5Q2xpZW50IiwiUXVlcnlDbGllbnRQcm92aWRlciIsImNvbmZpZyIsIlRvYXN0ZXIiLCJkeW5hbWljIiwicXVlcnlDbGllbnQiLCJEeW5hbWljTGF5b3V0Iiwic3NyIiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJjbGllbnQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_app.jsx\n");

/***/ }),

/***/ "./src/utils/wallet.js":
/*!*****************************!*\
  !*** ./src/utils/wallet.js ***!
  \*****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config)\n/* harmony export */ });\n/* harmony import */ var wagmi__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! wagmi */ \"wagmi\");\n/* harmony import */ var wagmi_chains__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! wagmi/chains */ \"wagmi/chains\");\n/* harmony import */ var wagmi_connectors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! wagmi/connectors */ \"wagmi/connectors\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([wagmi__WEBPACK_IMPORTED_MODULE_0__, wagmi_chains__WEBPACK_IMPORTED_MODULE_1__, wagmi_connectors__WEBPACK_IMPORTED_MODULE_2__]);\n([wagmi__WEBPACK_IMPORTED_MODULE_0__, wagmi_chains__WEBPACK_IMPORTED_MODULE_1__, wagmi_connectors__WEBPACK_IMPORTED_MODULE_2__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n// Use Sepolia testnet\nconst sepoliaRpcUrl = \"https://ethereum-sepolia.publicnode.com\" || 0;\nconst config = (0,wagmi__WEBPACK_IMPORTED_MODULE_0__.createConfig)({\n    chains: [\n        wagmi_chains__WEBPACK_IMPORTED_MODULE_1__.sepolia\n    ],\n    connectors: [\n        (0,wagmi_connectors__WEBPACK_IMPORTED_MODULE_2__.injected)()\n    ],\n    transports: {\n        [wagmi_chains__WEBPACK_IMPORTED_MODULE_1__.sepolia.id]: (0,wagmi__WEBPACK_IMPORTED_MODULE_0__.http)(sepoliaRpcUrl)\n    }\n});\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvdXRpbHMvd2FsbGV0LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBMkM7QUFDSjtBQUNLO0FBRTVDLHNCQUFzQjtBQUN0QixNQUFNSSxnQkFBZ0JDLHlDQUF1QyxJQUFJO0FBRTFELE1BQU1HLFNBQVNQLG1EQUFZQSxDQUFDO0lBQ2pDUSxRQUFRO1FBQUNQLGlEQUFPQTtLQUFDO0lBQ2pCUSxZQUFZO1FBQ1ZQLDBEQUFRQTtLQUNUO0lBQ0RRLFlBQVk7UUFDVixDQUFDVCxpREFBT0EsQ0FBQ1UsRUFBRSxDQUFDLEVBQUVaLDJDQUFJQSxDQUFDSTtJQUNyQjtBQUNGLEdBQUciLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kYXJrbm9kZS1kZXgvLi9zcmMvdXRpbHMvd2FsbGV0LmpzPzYxZGIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaHR0cCwgY3JlYXRlQ29uZmlnIH0gZnJvbSAnd2FnbWknO1xuaW1wb3J0IHsgc2Vwb2xpYSB9IGZyb20gJ3dhZ21pL2NoYWlucyc7XG5pbXBvcnQgeyBpbmplY3RlZCB9IGZyb20gJ3dhZ21pL2Nvbm5lY3RvcnMnO1xuXG4vLyBVc2UgU2Vwb2xpYSB0ZXN0bmV0XG5jb25zdCBzZXBvbGlhUnBjVXJsID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU0VQT0xJQV9SUENfVVJMIHx8ICdodHRwczovL2V0aGVyZXVtLXNlcG9saWEucHVibGljbm9kZS5jb20nO1xuXG5leHBvcnQgY29uc3QgY29uZmlnID0gY3JlYXRlQ29uZmlnKHtcbiAgY2hhaW5zOiBbc2Vwb2xpYV0sXG4gIGNvbm5lY3RvcnM6IFtcbiAgICBpbmplY3RlZCgpLFxuICBdLFxuICB0cmFuc3BvcnRzOiB7XG4gICAgW3NlcG9saWEuaWRdOiBodHRwKHNlcG9saWFScGNVcmwpLFxuICB9LFxufSk7Il0sIm5hbWVzIjpbImh0dHAiLCJjcmVhdGVDb25maWciLCJzZXBvbGlhIiwiaW5qZWN0ZWQiLCJzZXBvbGlhUnBjVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NFUE9MSUFfUlBDX1VSTCIsImNvbmZpZyIsImNoYWlucyIsImNvbm5lY3RvcnMiLCJ0cmFuc3BvcnRzIiwiaWQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/utils/wallet.js\n");

/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "@tanstack/react-query":
/*!****************************************!*\
  !*** external "@tanstack/react-query" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@tanstack/react-query");;

/***/ }),

/***/ "react-hot-toast":
/*!**********************************!*\
  !*** external "react-hot-toast" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = import("react-hot-toast");;

/***/ }),

/***/ "wagmi":
/*!************************!*\
  !*** external "wagmi" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = import("wagmi");;

/***/ }),

/***/ "wagmi/chains":
/*!*******************************!*\
  !*** external "wagmi/chains" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = import("wagmi/chains");;

/***/ }),

/***/ "wagmi/connectors":
/*!***********************************!*\
  !*** external "wagmi/connectors" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = import("wagmi/connectors");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.jsx")));
module.exports = __webpack_exports__;

})();