let editor;

document.addEventListener("DOMContentLoaded", function () {

	let button_visible = false;

	editor = grapesjs.init({
		container: "#gjs",
		height: "780px",
		fromElement: true,
		// Editor가 수정되면 beforeUnload 표시되지 않게 하기
		// 해당 로직은, `changesCount` 즉, 해당 editor의 변화한 개체 수에 반응하는데
		// 밑의 속성은 개체 수를 보지도 않고, 그냥 안하겠다고 하는것과 마찬가지임
		noticeOnUnload: false,
		blockManager: {
			appendTo: '#blocks',
			blocks: [{
				id: 'test1Block',
				label: '<div><img src="https://picsum.photos/70/70"/><div class="my-label-block">Label block</div></div>',
				content: `<div style="padding-top:50px; padding-bottom:50px; text-align:center">Test block</div>`
			}]
		},
		storageManager: {
			autosave: 0,
			autoload: 0
		},
		styleManager: {
			appendTo: '.styles-container',
			sectors: [{
				name: "Background",
				open: true,
				// Use built-in properties
				buildProps: ['width', 'min-height'],
				// Use `properties` to define/override single property
				properties: [
					{
						// Type of the input,
						// options: integer | radio | select | color | slider | file | composite | stack
						type: 'integer',
						name: 'The width', // Label for the property
						property: 'width', // CSS property (if buildProps contains it will be extended)
						units: ['px', '%'], // Units, available only for 'integer' types
						defaults: 'auto', // Default value
						min: 0, // Min value, available only for 'integer' types
					}
				]
			}, {
				name: 'Padding',
				open: true,
				buildProps: ['padding-top', 'padding-bottom'],
				properties: [
					{
						id: 'custom-prop',
						name: 'Custom Label',
						property: 'font-size',
						type: 'select',
						defaults: '10px',
						// List of options, available only for 'select' and 'radio'  types
						options: [
							{ value: '0px', name: 'None' },
							{ value: '12px', name: 'Tiny' },
							{ value: '18px', name: 'Medium' },
							{ value: '32px', name: 'Big' },
						],
					}
				]
			}]
		},
		panels: {
			defaults: [
				{
					id: 'panel-top',
					el: '.panel__top'
				},
				{
					id: 'panel-left',
					el: '.panel__left'
				},
				{
					id: 'panel-right',
					el: '.panel__right'
				}
			]
		},
		assetManager: {
			credential: 'include',
			// upload: "/compose/ajax/file/upload",
			// uploadName: 'templateFiles',
			multiUpload: true,
			// autoAdd: true,
			uploadFile: function(e) {
				// console.log("E: ",e)
				var files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
				console.log("Files: ",files)
				console.log("e : ",e)
				// console.log("--sidebar1--")
				for (var i = files.length - 1; i >= 0; i--) {
					// console.log("--sidebar2--")
					sendFile(files[i], this);
					// console.log(files[i])
					// console.log(this)
				}
			}
		},
		traitManager: {
			appendTo: '.traits-container',
		},
		plugins: ['gjs-preset-newsletter', 'gjs-plugin-ckeditor'],
		pluginsOpts: {
			'gjs-preset-newsletter': {
				modalLabelImport: 'Paste all your code here below and click import',
				modalLabelExport: 'Copy the code and use it wherever you want',
				codeViewerTheme: 'material',
				//defaultTemplate: templateImport,
				importPlaceholder: '<table class="table"><tr><td class="cell">Hello world!</td></tr></table>',
				cellStyle: {
					'font-size': '12px',
					'font-weight': 300,
					'vertical-align': 'top',
					color: 'rgb(111, 119, 125)',
					margin: 0,
					padding: 0,
				}
			},
			'gjs-plugin-ckeditor': {
				position: 'center',
				// options: {
				// 	startupFocus: true,
				// 	extraAllowedContent: '*(*);*{*}', // Allows any class and any inline style
				// 	allowedContent: true, // Disable auto-formatting, class removing, etc.
				// 	// enterMode: CKEDITOR.ENTER_BR,
				// 	extraPlugins: 'sharedspace,justify,colorbutton,panelbutton,font',
				// 	toolbar: [
				// 		{ name: 'styles', items: ['Font', 'FontSize' ] },
				// 		['Bold', 'Italic', 'Underline', 'Strike'],
				// 		{name: 'paragraph', items : [ 'NumberedList', 'BulletedList']},
				// 		{name: 'links', items: ['Link', 'Unlink']},
				// 		{name: 'colors', items: [ 'TextColor', 'BGColor' ]},
				// 	],
				// }
			}
		},
		cssIcons:"/inspinia/font-awesome/css/font-awesome.css"
	});

	// juice 옵션을 통해, inline 처리 불가능한 style을 제거하고 받아옴
	editor.getInlinedHtml = function(){
		return editor.runCommand('gjs-get-inlined-html', {
			removeStyleTags: true,
			preserveMediaQueries: false,
			preserveFontFaces: false,
		});
	}

	// inline 처리 불가능한 style이 붙지 않도록 html을 주입
	editor.setHtml = (html) => {
		if(html == null || html === ''){
			editor.setComponents(html)
		}
		else {

			var startTime = new Date().getTime();

			let inlined = juice(html, {
				removeStyleTags:true,
				preserveMediaQueries: false,
				preserveFontFaces: false,
			})
//			editor.CssComposer.clear();
			editor.setComponents(inlined)

			var endTime = new Date().getTime();

			console.log(endTime-startTime)

			// juice(inline-css) 없이 사용할때
			// var startTime = new Date().getTime();
			//
			// editor.setComponents(html)
			// let inlined = editor.getInlinedHtml()
			// editor.CssComposer.clear();
			// editor.setComponents(inlined)
			//
			// var endTime = new Date().getTime();


			// editor.CssComposer.clear();
			// editor.setComponents(html)
		}
	}

	$('.button_desktop').click(()=>{
		editor.runCommand("set-device-desktop")
	})

	$('.button_tablet').click(()=>{
		editor.runCommand("set-device-tablet")
	})

	$('.button_phone').click(()=>{
		editor.runCommand("set-device-mobile")
	})

	$('.button_visible').click(()=>{
		if(button_visible){
			editor.runCommand("sw-visibility");
			button_visible = false
		}else{
			editor.stopCommand("sw-visibility");
			button_visible = true
		}
	})

	$('.button_export').click(() => {
		editor.runCommand('export-template')
	})

	$('.button_import').click(() => {
		// import 버튼을 눌렀을때, 사용 불가능한 style 태그를 제거하도록 이벤트 수정
		setTimeout(()=>{
			let btn_imp = document.querySelector('.gjs-btn-import')
			console.log(btn_imp)
			let oldOnClick = btn_imp.onclick
			btn_imp.onclick = ()=>{
				oldOnClick();
//				editor.CssComposer.clear();
				editor.setComponents(editor.getInlinedHtml())
			}
		})
		// model 동기 코드
		editor.runCommand('gjs-open-import-template')
	})

	$('.button_repeat').click(()=>{
		editor.UndoManager.redo()
	})

	$('.button_undo').click(() => {
		editor.UndoManager.undo()
	})

	var traitsSector = $('<div class="gjs-sm-sector no-select gjs-one-bg gjs-two-color">' +
		'<div class="gjs-sm-title"><span class="icon-settings fa fa-cog"></span> 설정</div>' +
		'<div class="gjs-sm-properties" style="display: none;"></div></div>');
	var traitsProps = traitsSector.find('.gjs-sm-properties');
	traitsProps.append($('.gjs-trt-traits'));
	$('.styles-container').before(traitsSector);
	traitsSector.find('.gjs-sm-title').on('click', function () {
		var traitStyle = traitsProps.get(0).style;
		var hidden = traitStyle.display == 'none';
		if (hidden) {
			traitStyle.display = 'block';
		} else {
			traitStyle.display = 'none';
		}
	});

	editor.BlockManager.getAll().reset();

	editor.BlockManager.add('test1Block', {
		category: "Basic",
		label: "링크",
		attributes: {
			class: 'fa fa-link',
			href: '',
		},
		content: {
			type: 'link',
			content: 'Link',
			style: {
				color: '#3b97e3',
				Background: 'white'
			}
		},
	})

	editor.BlockManager.add('test2Block', {
		category: "Basic",
		label: "링크블럭",
		attributes: { class: 'fa fa-link' },
		content: {
			type: 'link',
			editable: false,
			droppable: true,
			style: {
				display: 'inline-block',
				padding: '5px',
				'min-height': '50px',
				'min-width': '50px'
			}
		},
	})

	editor.BlockManager.add('test3Block', {
		label: '인용문구',
		category: 'Basic',
		attributes: { class: 'fa fa-quote-right', },
		content: `<blockquote class="quote">
			이 영역은 빗금으로 내용이 적힙니다.
		  </blockquote>`
	})

	var tableStyleStr =
		`height: 150px;
		margin: 0 auto 10px auto;
		padding: 5px 5px 5px 5px;
		width: 100%;`

	let cellStyleStr =
		`font-size: 12px;
		font-weight: 300;
		vertical-align: top;
		color: rgb(111, 119, 125);
		margin: 0;
		padding: 0;`


	editor.BlockManager.add('test4Block', {
		label: '1단',
		category: '',
		attributes: { class: 'gjs-fonts gjs-f-b1' },
		content:
			`<table style="` + tableStyleStr + `">
					<tr>
					  <td style="` + cellStyleStr + ` width: 100%;"></td>
					</tr>
				</table>`,
	})

	editor.BlockManager.add('test5Block', {
		label: '2단',
		category: '',
		attributes: { class: 'gjs-fonts gjs-f-b2' },
		content:
			`<table style="` + tableStyleStr + `">
					<tr>
					  <td style="` + cellStyleStr + ` width: 50%;"></td>
					  <td style="` + cellStyleStr + ` width: 50%;"></td>
					</tr>
				</table>`,
	})

	editor.BlockManager.add('test6Block', {
		label: '3단',
		category: '',
		attributes: { class: 'gjs-fonts gjs-f-b3' },
		content:
			`<table style="` + tableStyleStr + `">
					<tr>
					  <td style="` + cellStyleStr + ` width: 33%;"></td>
					  <td style="` + cellStyleStr + ` width: 33%;"></td>
					  <td style="` + cellStyleStr + ` width: 33%;"></td>
					</tr>
				</table>`,
	})

	editor.BlockManager.add('test7Block', {
		label: '3/7단',
		category: '',
		attributes: { class: 'gjs-fonts gjs-f-b37' },
		content:
			`<table style="` + tableStyleStr + `">
					<tr>
					  <td style="` + cellStyleStr + ` width: 30%;"></td>
					  <td style="` + cellStyleStr + ` width: 70%;"></td>
					</tr>
				</table>`,
	})

	editor.BlockManager.add('test8Block', {
		label: "버튼",
		category: "",
		content: '<a class="button_template">버튼</a>',
		attributes: { class: 'gjs-fonts gjs-f-button' }
	})

	editor.BlockManager.add('test9Block', {
		label: "분리선",
		category: "",
		content: `<table style="width: 100%; margin-top: 10px; margin-bottom: 10px;">
					<tr>
					  <td class="divider"></td>
					</tr>
				  </table>
			  <style>
			  .divider {
				background-color: rgba(0, 0, 0, 0.1);
				height: 1px;
			  }
			  </style>`,
		attributes: { class: 'gjs-fonts gjs-f-divider' }
	})

	editor.BlockManager.add('test10Block', {
		label: "텍스트",
		category: "",
		attributes: { class: 'gjs-fonts gjs-f-text' },
		content: {
			type: 'text',
			content: '내용을 입력해 주세요.',
			style: { padding: '10px' },
			activeOnRender: 1
		},
	})

	editor.BlockManager.add('test11Block', {
		label: "텍스트 영역",
		category: "",
		content: '<h1 style="padding:10px;" class="heading">제목을 입력해 주세요.</h1><p class="paragraph" style="padding:10px;">내용은 이쪽에 입력해주세요.</p>',
		attributes: { class: 'gjs-fonts gjs-f-h1p' }
	})

	editor.BlockManager.add('test12Block', {
		label: "이미지",
		category: "",
		attributes: { class: 'gjs-fonts gjs-f-image' },
		content: {
			type: 'image',
			style: { color: 'black' },
			activeOnRender: 1
		},
	})

	let gridItem =
		`<table class="grid-item-card">
        <tr>
          <td class="grid-item-card-cell">
            <img class="grid-item-image" src="http://placehold.it/250x150/78c5d6/fff/" alt="Image"/>
            <table class="grid-item-card-body">
              <tr>
                <td class="grid-item-card-content">
                  <h1 class="card-title">제목</h1>
                  <p class="card-text">내용을 입력해주세요.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;

	editor.BlockManager.add('test13Block', {
		label: "격자판",
		category: "",
		content: `<table class="grid-item-row">
        <tr>
          <td class="grid-item-cell2-l">`+ gridItem + `</td>
          <td class="grid-item-cell2-r">`+ gridItem + `</td>
        </tr>
      </table>`,
		attributes: { class: 'fa fa-th' }
	})

	let listItem =
		`<table class="list-item">
        <tr>
          <td class="list-item-cell">
            <table class="list-item-content">
              <tr class="list-item-row">
                <td class="list-cell-left">
                  <img class="list-item-image" src="http://placehold.it/150x150/78c5d6/fff/" alt="Image"/>
                </td>
                <td class="list-cell-right">
                  <h1 class="card-title">제목</h1>
                  <p class="card-text">내용을 입력해주세요.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;

	editor.BlockManager.add('test14Block', {
		label: "리스트",
		category: "",
		content: listItem + listItem,
		attributes: { class: 'fa fa-th-list' }
	})

	// document.querySelector('.panel__devices').style.left = document.querySelector('#blocks').scrollWidth+"px"

	// component 보이게끔 처리
	editor.runCommand("sw-visibility");

	editor.I18n.addMessages({ko: ko})


});




