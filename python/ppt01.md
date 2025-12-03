# 파워포인트 슬라이드에서 이미지를 찾아 테두리를 설정

```python
from pptx import Presentation
from pptx.util import Pt
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.util import RGBColor
from pptx.enum.dml import MSO_LINE_DASH_STYLE

def add_border_to_images(input_file, output_file, 
                         border_color=(0, 0, 0), 
                         border_width=2.5,
                         dash_style='solid'):
    """
    파워포인트 파일의 모든 이미지에 테두리 추가
    
    Parameters:
    - input_file: 입력 PPT 파일 경로
    - output_file: 출력 PPT 파일 경로
    - border_color: RGB 튜플 (기본: 검정색)
    - border_width: 테두리 두께 (포인트 단위, 기본: 2.5)
    - dash_style: 선 스타일 ('solid', 'dash', 'dot', 'dash_dot')
    """
    
    # 프레젠테이션 열기
    prs = Presentation(input_file)
    
    # 선 스타일 매핑
    line_styles = {
        'solid': MSO_LINE_DASH_STYLE.SOLID,
        'dash': MSO_LINE_DASH_STYLE.DASH,
        'dot': MSO_LINE_DASH_STYLE.DOT,
        'dash_dot': MSO_LINE_DASH_STYLE.DASH_DOT
    }
    
    image_count = 0
    
    # 모든 슬라이드 순회
    for slide_num, slide in enumerate(prs.slides, 1):
        print(f"\n슬라이드 {slide_num} 처리 중...")
        
        # 슬라이드의 모든 도형 확인
        for shape in slide.shapes:
            # 이미지인지 확인
            if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
                image_count += 1
                print(f"  - 이미지 발견: {shape.name}")
                
                # 테두리 설정
                line = shape.line
                line.color.rgb = RGBColor(*border_color)
                line.width = Pt(border_width)
                line.dash_style = line_styles.get(dash_style, MSO_LINE_DASH_STYLE.SOLID)
                
                print(f"    테두리 적용 완료 (색상: RGB{border_color}, 두께: {border_width}pt)")
    
    # 저장
    prs.save(output_file)
    print(f"\n총 {image_count}개의 이미지에 테두리를 추가했습니다.")
    print(f"저장 완료: {output_file}")

# 사용 예제 1: 기본 검정 테두리
if __name__ == "__main__":
    add_border_to_images(
        input_file='original.pptx',
        output_file='bordered.pptx'
    )
```

## 다양한 스타일 예제

```python
# 예제 2: 빨간색 굵은 테두리
add_border_to_images(
    input_file='original.pptx',
    output_file='red_border.pptx',
    border_color=(255, 0, 0),  # 빨간색
    border_width=5.0
)

# 예제 3: 파란색 점선 테두리
add_border_to_images(
    input_file='original.pptx',
    output_file='blue_dash.pptx',
    border_color=(0, 0, 255),  # 파란색
    border_width=3.0,
    dash_style='dash'
)

# 예제 4: 회색 가는 테두리
add_border_to_images(
    input_file='original.pptx',
    output_file='gray_thin.pptx',
    border_color=(128, 128, 128),  # 회색
    border_width=1.0
)
```

## 고급 버전: 선택적 이미지 처리

```python
from pptx import Presentation
from pptx.util import Pt, Inches
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.util import RGBColor
from pptx.enum.dml import MSO_LINE_DASH_STYLE

def add_border_to_images_advanced(input_file, output_file,
                                   border_color=(0, 0, 0),
                                   border_width=2.5,
                                   dash_style='solid',
                                   min_width=None,
                                   min_height=None,
                                   specific_slides=None):
    """
    고급 옵션으로 이미지에 테두리 추가
    
    Parameters:
    - min_width: 최소 너비 (인치) - 이보다 큰 이미지만 처리
    - min_height: 최소 높이 (인치) - 이보다 큰 이미지만 처리
    - specific_slides: 처리할 슬라이드 번호 리스트 (예: [1, 3, 5])
    """
    
    prs = Presentation(input_file)
    
    line_styles = {
        'solid': MSO_LINE_DASH_STYLE.SOLID,
        'dash': MSO_LINE_DASH_STYLE.DASH,
        'dot': MSO_LINE_DASH_STYLE.DOT,
        'dash_dot': MSO_LINE_DASH_STYLE.DASH_DOT
    }
    
    image_count = 0
    skipped_count = 0
    
    for slide_num, slide in enumerate(prs.slides, 1):
        # 특정 슬라이드만 처리하는 경우
        if specific_slides and slide_num not in specific_slides:
            continue
            
        print(f"\n슬라이드 {slide_num} 처리 중...")
        
        for shape in slide.shapes:
            if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
                # 크기 조건 확인
                width_inches = shape.width / 914400  # EMU to inches
                height_inches = shape.height / 914400
                
                should_process = True
                
                if min_width and width_inches < min_width:
                    should_process = False
                    print(f"  - 이미지 건너뜀 (너비 부족): {shape.name} ({width_inches:.2f}\")")
                    
                if min_height and height_inches < min_height:
                    should_process = False
                    print(f"  - 이미지 건너뜀 (높이 부족): {shape.name} ({height_inches:.2f}\")")
                
                if should_process:
                    image_count += 1
                    print(f"  - 이미지 처리: {shape.name} ({width_inches:.2f}\" x {height_inches:.2f}\")")
                    
                    line = shape.line
                    line.color.rgb = RGBColor(*border_color)
                    line.width = Pt(border_width)
                    line.dash_style = line_styles.get(dash_style, MSO_LINE_DASH_STYLE.SOLID)
                else:
                    skipped_count += 1
    
    prs.save(output_file)
    print(f"\n처리 완료:")
    print(f"  - 테두리 추가: {image_count}개")
    print(f"  - 건너뜀: {skipped_count}개")
    print(f"  - 저장 위치: {output_file}")

# 고급 사용 예제
if __name__ == "__main__":
    # 2인치 이상 큰 이미지만 처리
    add_border_to_images_advanced(
        input_file='original.pptx',
        output_file='large_images_only.pptx',
        border_color=(0, 100, 200),
        border_width=3.0,
        min_width=2.0,
        min_height=2.0
    )
    
    # 1, 3, 5번 슬라이드만 처리
    add_border_to_images_advanced(
        input_file='original.pptx',
        output_file='specific_slides.pptx',
        specific_slides=[1, 3, 5]
    )
```

## 테스트용 PPT 생성 프로그램

```python
from pptx import Presentation
from pptx.util import Inches

def create_test_presentation():
    """테스트용 이미지가 포함된 PPT 생성"""
    prs = Presentation()
    
    # 슬라이드 1: 여러 이미지
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    
    # 이미지 3개 추가 (실제 이미지 파일이 있어야 함)
    try:
        slide.shapes.add_picture('image1.jpg', Inches(1), Inches(1), width=Inches(3))
        slide.shapes.add_picture('image2.jpg', Inches(5), Inches(1), width=Inches(3))
        slide.shapes.add_picture('image3.jpg', Inches(3), Inches(4), width=Inches(2))
    except:
        print("이미지 파일이 없습니다. 실제 이미지 파일을 준비해주세요.")
    
    prs.save('test_presentation.pptx')
    print("테스트 프레젠테이션 생성 완료!")

# 전체 워크플로우
if __name__ == "__main__":
    # 1. 테스트 PPT 생성 (이미지 파일 필요)
    # create_test_presentation()
    
    # 2. 테두리 추가
    add_border_to_images(
        input_file='original.pptx',
        output_file='bordered.pptx',
        border_color=(0, 0, 0),
        border_width=2.5
    )
```

**주요 기능:**
- ✅ 모든 슬라이드의 이미지 자동 탐지
- ✅ 테두리 색상, 두께, 스타일 커스터마이징
- ✅ 크기 기반 필터링 (큰 이미지만 처리)
- ✅ 특정 슬라이드만 선택적 처리
- ✅ 처리 과정 상세 로그 출력

**필요한 라이브러리:**
```bash
pip install python-pptx
```

이 프로그램을 실행하면 원본 파일은 그대로 두고 새로운 파일에 테두리가 적용된 버전이 생성됩니다. 추가로 필요한 기능이 있으시면 말씀해주세요!
