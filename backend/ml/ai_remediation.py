import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Configure API Key and Base URL if available
AI_API_KEY = os.getenv("AI_API_KEY")
AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.groq.com/openai/v1")
AI_MODEL = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")

client = None
if AI_API_KEY:
    client = OpenAI(
        api_key=AI_API_KEY,
        base_url=AI_BASE_URL
    )

class AIRemediationService:
    def __init__(self):
        self.model_name = AI_MODEL

    def generate_remediation(self, vuln_type: str, url: str, parameter: str, payload: str, base_recommendation: str) -> tuple[str, str]:
        """
        Calls OpenAI-compatible API to generate specific remediation advice and code snippet.
        Returns: (ai_recommendation, ai_code_snippet)
        """
        if not client:
            return (
                f"Lỗi: Chưa cấu hình AI_API_KEY trong file .env. Vui lòng cấu hình để sử dụng tính năng này.\n\nKhuyến nghị gốc: {base_recommendation}",
                "// Cấu hình AI_API_KEY để xem code khắc phục."
            )

        try:
            prompt = f"""
            Bạn là một chuyên gia bảo mật ứng dụng web. Một lỗ hổng đã được phát hiện trên hệ thống với các chi tiết sau:
            - Loại lỗ hổng: {vuln_type}
            - URL mục tiêu: {url}
            - Tham số bị ảnh hưởng: {parameter or 'Không xác định'}
            - Payload tấn công mẫu: {payload or 'Không có'}
            
            Cơ sở tri thức và quy chuẩn nội bộ yêu cầu hướng khắc phục như sau: 
            "{base_recommendation}"
            
            Dựa vào thông tin trên, hãy trả về kết quả theo định dạng chuẩn sau đây, không bao gồm markdown ``` ở ngoài cùng, chỉ trả về đúng 2 phần được phân cách bởi dải phân cách '---CODE_SNIPPET_START---':
            
            [Giải thích chi tiết ngắn gọn (dưới 100 từ) về cách payload trên khai thác lỗi và cách khắc phục cụ thể theo ngữ cảnh của URL/Tham số. Tuyệt đối tuân thủ quy chuẩn nội bộ ở trên]
            ---CODE_SNIPPET_START---
            [Viết một đoạn code an toàn mẫu (Python/JavaScript/PHP tùy ngữ cảnh hoặc chung chung) để vá lỗi này]
            """
            
            response = client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful cybersecurity expert."},
                    {"role": "user", "content": prompt}
                ],
                timeout=15
            )
            
            text = response.choices[0].message.content.strip()
            
            if "---CODE_SNIPPET_START---" in text:
                parts = text.split("---CODE_SNIPPET_START---")
                ai_rec = parts[0].strip()
                ai_code = parts[1].strip()
                
                # Loại bỏ markdown code block nếu AI lỡ chèn vào snippet
                if ai_code.startswith("```"):
                    lines = ai_code.split("\n")
                    if len(lines) > 2 and lines[-1].strip() == "```":
                        ai_code = "\n".join(lines[1:-1])
                return ai_rec, ai_code
            else:
                return text, "// Không thể sinh code snippet cụ thể. Vui lòng xem mô tả."
                
        except Exception as e:
            print(f"Error calling AI API: {e}")
            raise Exception(f"Có lỗi xảy ra khi gọi AI: {str(e)}")
