import { useState, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Check } from 'lucide-react'

interface TextInputProps {
    type?: 'text' | 'email' | 'tel'
    placeholder?: string
    onSubmit: (value: string) => void
    showCountryCode?: boolean
    delay?: number
    maxLength?: number
}

export function TextInput({
    type = 'text',
    placeholder = 'Digite sua resposta...',
    onSubmit,
    showCountryCode = false,
    delay = 0,
    maxLength
}: TextInputProps) {
    const [value, setValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (value.trim() && !isSubmitting) {
            setIsSubmitting(true)

            // Small delay for visual feedback
            await new Promise(resolve => setTimeout(resolve, 200))

            onSubmit(value.trim())
            setValue('')
            setIsSubmitting(false)
        }
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
        >
            <div className="flex gap-2 items-center">
                {showCountryCode && (
                    <motion.select
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: delay + 0.1 }}
                        className="px-3 py-3 rounded-xl font-medium"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '1.5px solid rgba(255, 255, 255, 0.1)',
                            color: '#FFFFFF',
                            fontSize: '0.9375rem',
                            outline: 'none',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <option value="+55">🇧🇷 +55</option>
                    </motion.select>
                )}

                <div className="flex-1 relative">
                    {/* Animated focus ring */}
                    <AnimatePresence>
                        {isFocused && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute -inset-0.5 rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.2), rgba(0, 255, 0, 0.1))',
                                    filter: 'blur(8px)',
                                    zIndex: -1
                                }}
                            />
                        )}
                    </AnimatePresence>

                    <input
                        type={type}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        autoFocus
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-xl font-medium transition-all duration-300"
                        style={{
                            background: isFocused
                                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: isFocused
                                ? '1.5px solid rgba(0, 255, 0, 0.4)'
                                : '1.5px solid rgba(255, 255, 255, 0.1)',
                            color: '#FFFFFF',
                            fontSize: '0.9375rem',
                            outline: 'none',
                            boxShadow: isFocused
                                ? '0 4px 16px rgba(0, 255, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                : '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        }}
                    />

                    {/* Character counter */}
                    {maxLength && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isFocused ? 1 : 0 }}
                            className="absolute -bottom-5 right-0 text-xs"
                            style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                        >
                            {value.length}/{maxLength}
                        </motion.div>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={!value.trim() || isSubmitting}
                    className="p-3 rounded-xl transition-all duration-300 relative overflow-hidden"
                    style={{
                        background: value.trim() && !isSubmitting
                            ? 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)'
                            : 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: value.trim() ? '#082721' : 'rgba(255, 255, 255, 0.3)',
                        cursor: value.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                        boxShadow: value.trim() && !isSubmitting
                            ? '0 4px 12px rgba(0, 255, 0, 0.3)'
                            : 'none'
                    }}
                >
                    <AnimatePresence mode="wait">
                        {isSubmitting ? (
                            <motion.div
                                key="check"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                            >
                                <Check className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="send"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <Send className="w-5 h-5" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </motion.div>
    )
}
