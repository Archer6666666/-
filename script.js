// 共用功能
document.addEventListener('DOMContentLoaded', () => {
    // 登录/注册按钮事件
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', () => {
            loginModal.classList.remove('hidden');
        });
    }
    
    if (registerBtn && registerModal) {
        registerBtn.addEventListener('click', () => {
            registerModal.classList.remove('hidden');
        });
    }
    
    // 关闭模态框
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.add('hidden');
        });
    });
    
    // 评估页面的提交功能
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', evaluateCode);
    }
    
    // 清空按钮
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('codeInput').value = '';
            document.getElementById('resultCard').classList.add('hidden');
        });
    }
});



// 代码评估函数
/*async function evaluateCode() {
    const codeInput = document.getElementById('codeInput');
    const resultCard = document.getElementById('resultCard');
    const scoreValue = document.getElementById('scoreValue');
    const feedbackContent = document.getElementById('feedbackContent');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!codeInput.value.trim()) {
        alert('请输入要评估的代码！');
        return;
    }
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 评估中...';
    submitBtn.disabled = true;
    
    try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 模拟返回数据
        const mockData = {
            score: Math.floor(Math.random() * 40) + 60,
            feedback: `代码分析完成：\n\n1. 主要优点：\n- 基本结构正确\n- 核心功能实现\n\n2. 发现问题：\n- 缺少错误处理\n- 存在硬编码值\n\n3. 改进建议：\n- 添加输入验证\n- 提取魔法数为常量\n- 增加单元测试用例`
        };
        
        // 显示结果
        scoreValue.textContent = `${mockData.score}/100`;
        feedbackContent.textContent = mockData.feedback;
        resultCard.classList.remove('hidden');
        
        // 滚动到结果
        resultCard.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('评估失败:', error);
        alert('评估服务暂时不可用');
    } finally {
        submitBtn.innerHTML = '<i class="fas fa-play"></i> 运行评估';
        submitBtn.disabled = false;
    }
}*/



// 修改后的 evaluateCode 函数
async function evaluateCode() {
    const codeInput = document.getElementById('codeInput');
    const resultCard = document.getElementById('resultCard');
    const scoreValue = document.getElementById('scoreValue');
    const feedbackContent = document.getElementById('feedbackContent');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!codeInput.value.trim()) {
        alert('请输入要评估的代码！');
        return;
    }
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 评估中...';
    submitBtn.disabled = true;
    
    try {
        // 调用后端API
        const response = await fetch('http://localhost:3001/api/evaluate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: codeInput.value.trim()
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 显示结果
        scoreValue.textContent = `${data.score || 0}/100`;
        feedbackContent.textContent = data.feedback || '未收到有效反馈';
        resultCard.classList.remove('hidden');
        
        // 滚动到结果
        resultCard.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('评估失败:', error);
        alert(`评估失败: ${error.message}`);
    } finally {
        submitBtn.innerHTML = '<i class="fas fa-play"></i> 运行评估';
        submitBtn.disabled = false;
    }
}
