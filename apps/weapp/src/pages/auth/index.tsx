import Taro from '@tarojs/taro'
import { View, Text, Input } from '@tarojs/components'
import { useState } from 'react'
import { isChinese } from '../../i18n'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!email || !password) {
      setError(isChinese() ? '请输入邮箱和密码' : 'Email and password required')
      return
    }
    if (!isLogin && password !== confirmPassword) {
      setError(isChinese() ? '两次密码不一致' : 'Passwords do not match')
      return
    }
    if (!isLogin && password.length < 8) {
      setError(isChinese() ? '密码至少8位' : 'Password must be 8+ chars')
      return
    }

    setLoading(true)
    try {
      const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup'
      const res = await Taro.request({
        url: endpoint,
        method: 'POST',
        data: { email, password },
        header: { 'Content-Type': 'application/json' },
      })

      if (res.statusCode >= 400) {
        throw new Error((res.data as any)?.error || 'Auth failed')
      }

      // Store user info
      Taro.setStorageSync('user_email', email)
      Taro.showToast({ title: isChinese() ? '登录成功' : 'Success', icon: 'success' })
      Taro.switchTab({ url: '/pages/index/index' })
    } catch (err: any) {
      setError(err.message || 'Auth failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(isChinese() ? '小程序暂不支持Google登录，请使用邮箱注册' : 'Google login not supported in mini-program. Use email instead.')
  }

  const userEmail = (() => {
    try { return Taro.getStorageSync('user_email') } catch { return '' }
  })()

  if (userEmail) {
    return (
      <View className='page' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <View style={{ fontSize: 48, marginBottom: 16 }}>👋</View>
        <Text className='h2' style={{ marginBottom: 8 }}>{userEmail}</Text>
        <Text className='caption' style={{ marginBottom: 24 }}>{isChinese() ? '已登录' : 'Signed in'}</Text>
        <View
          className='btn btn-outline'
          onClick={() => {
            Taro.removeStorageSync('user_email')
            Taro.showToast({ title: isChinese() ? '已退出' : 'Signed out', icon: 'success' })
            setIsLogin(true)
          }}
        >
          {isChinese() ? '退出登录' : 'Sign Out'}
        </View>
      </View>
    )
  }

  return (
    <View className='auth-container'>
      <View className='auth-card'>
        <View className='auth-title'>
          <View style={{ fontSize: 48, marginBottom: 8 }}>🎬</View>
          <Text className='h2'>{isLogin ? (isChinese() ? '登录' : 'Sign In') : (isChinese() ? '注册' : 'Sign Up')}</Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text className='caption' style={{ marginBottom: 6, display: 'block' }}>{isChinese() ? '邮箱' : 'Email'}</Text>
          <Input
            className='input'
            type='text'
            placeholder={isChinese() ? 'you@example.com' : 'you@example.com'}
            value={email}
            onInput={(e) => setEmail(e.detail.value)}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text className='caption' style={{ marginBottom: 6, display: 'block' }}>{isChinese() ? '密码' : 'Password'}</Text>
          <Input
            className='input'
            type='password'
            placeholder='********'
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
          />
        </View>

        {!isLogin && (
          <View style={{ marginBottom: 16 }}>
            <Text className='caption' style={{ marginBottom: 6, display: 'block' }}>{isChinese() ? '确认密码' : 'Confirm Password'}</Text>
            <Input
              className='input'
              type='password'
              placeholder='********'
              value={confirmPassword}
              onInput={(e) => setConfirmPassword(e.detail.value)}
            />
          </View>
        )}

        {error && (
          <View style={{ marginBottom: 12, padding: 8, background: '#fef2f2', borderRadius: 8 }}>
            <Text style={{ color: '#ef4444', fontSize: 12 }}>{error}</Text>
          </View>
        )}

        <View
          className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
          onClick={loading ? undefined : handleSubmit}
        >
          {loading
            ? (isChinese() ? '处理中...' : 'Loading...')
            : (isLogin ? (isChinese() ? '登录' : 'Sign In') : (isChinese() ? '注册' : 'Sign Up'))
          }
        </View>

        <View className='auth-divider'>
          <Text>{isChinese() ? '或' : 'or'}</Text>
        </View>

        <View className='btn btn-outline' onClick={handleGoogleLogin}>
          <Text>{isChinese() ? 'Gmail 登录' : 'Google Sign In'}</Text>
        </View>

        <View className='auth-link'>
          <Text>
            {isLogin
              ? (isChinese() ? '没有账号？' : "Don't have an account?")
              : (isChinese() ? '已有账号？' : 'Already have an account?')
            }{' '}
          </Text>
          <Text onClick={() => { setIsLogin(!isLogin); setError('') }}>
            {isLogin ? (isChinese() ? '注册' : 'Sign Up') : (isChinese() ? '登录' : 'Sign In')}
          </Text>
        </View>
      </View>
    </View>
  )
}
