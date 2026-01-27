const traitInputAttr = { placeholder: 'eg. 텍스트 입력' };

// tooltip들은 모두 custom_editor에서 직접 수정을 통해 언어 변경

const ko = {
  assetManager: {
    addButton: '이미지 추가',
    inputPlh: 'http://path/to/the/image.jpg',
    modalTitle: '이미지 선택',
    uploadTitle: '원하는 파일을 여기에 놓거나 업로드를 위해 클릭'
  },
  // block에 대한 text는 custom_editor에서 block을 추가하는 곳에서 직접 수정을 통해 언어 변경
  blockManager: {
    // labels: {
    //   // 'block-id': 'Block Label',
    //   sect100: "테스트",
    // },
    // categories: {
    //   // 'category-id': 'Category Label',
    // }
  },
  // 컴포넌트들 알려주는곳(DOM)
  domComponents: {
    names: {
      '': '상자',
      wrapper: '바디',
      text: '텍스트',
      comment: '코멘트',
      image: '이미지',
      video: '동영상',
      label: '라벨',
      link: '링크',
      map: '지도',
      tfoot: '테이블 foot',
      tbody: '테이블 body',
      thead: '테이블 head',
      table: '테이블',
      row: '테이블 행',
      cell: '테이블 셀'
    }
  },
  // device에 대한 tooltip은 custom_editor에서 직접 수정을 통해 언어 변경
  deviceManager: {
    // device: 'Device',
    // devices: {
    //   desktop: '데스크탑',
    //   tablet: '태블릿',
    //   mobileLandscape: '모바일 환경',
    //   mobilePortrait: '모바일 Portrait'
    // }
  },
  panels: {
    buttons: {
      titles: {
        preview: '미리보기',
        fullscreen: '전체화면',
        'sw-visibility': 'components 보기',
        'export-template': '코드 보기',
        'open-sm': 'Style Manager 열기',
        'open-tm': '설정',
        'open-layers': 'Layer Manager 열기',
        'open-blocks': 'Blocks 열기'
      }
    }
  },
  selectorManager: {
    label: 'Classes',
    selected: '선택된',
    emptyState: '- 상태 -',
    states: {
      hover: 'Hover',
      active: 'Click',
      'nth-of-type(2n)': '짝수/홀수'
    }
  },
  styleManager:{
      empty: 'Style Manager 사용하려면, 먼저 element를 선택해주세요',
      layer: '레이어',
      blur:'blur',
      color: "색깔",
      fileButton: 'Images',
      sectors: {
          general: '기본설정',
          layout: '레이아웃',
          typography: '글꼴',
          decorations: '꾸미기',
          extra: 'Extra',
          flex: 'Flex',
          dimension: '크기 및 위치'
      },
      properties: {
          width: "너비",
          height: "높이",
          'max-width': "최대 너비",
          'min-height': "최대 높이",
          margin: "마진",
          'margin-top': '상',
          'margin-bottom': '하',
          'margin-left': '좌',
          'margin-right': '우',
          padding: "패딩",
          'padding-top': '상',
          'padding-bottom': '하',
          'padding-left': '좌',
          'padding-right': '우',
          'font-family': "폰트",
          'font-size': "크기",
          'font-weight':"굵기",
          'letter-spacing':"여백",
          "color":"텍스트 색상",
          "line-height":"줄높이",
          'text-align':"정렬",
          'text-decoration':"문자 장식",
          'font-style':"폰트스타일",
          'vertical-align':"수직정렬",
          'text-shadow':'텍스트 그림자',
          'background-color': '배경 색상',
          'background': "배경",
          'border-collapse':'테두리 겹치기',
          'border-radius':'테두리 원형화',
          'border-top-left-radius': '상단 왼쪽',
          'border-top-right-radius': '상단 오른쪽',
          'border-bottom-left-radius': '하단 왼쪽',
          'border-bottom-right-radius': '하단 오른쪽',
          'border':'테두리 선',
          'border-width': '두께',
          'border-style': '스타일',
          'border-color': '색상',
      }
  },
  traitManager: {
    empty: 'Trait Manager 사용하려면, 먼저 element를 선택해주세요',
    label: 'Component 설정',
    traits: {
      // The core library generates the name by their `name` property
      labels: {
        id: 'Id',
        alt: 'Alt',
        title: 'Title',
        href: '링크',
        target: 'Target',
      },
      // In a simple trait, like text input, these are used on input attributes
      attributes: {
        id: traitInputAttr,
        alt: traitInputAttr,
        title: traitInputAttr,
        href: { placeholder: 'eg. https://google.com' },
      },
      // In a trait like select, these are used to translate option names
      options: {
        target: {
          false: '현재 창',
          _blank: '새 창'
        }
      }
    }
  }
};