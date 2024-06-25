"use client"
import React, { FormEvent, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { addUserEmailToProduct } from '@/lib/actions'

interface ModalProps {
  productId: string
}

const Modal = ({ productId }: ModalProps) => {
  let [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState("")

  const closeModal = () => {
    setIsOpen(false)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    await addUserEmailToProduct(productId, email)
    setIsSubmitting(false)
    setEmail('')
    closeModal()
  }

  return (
    <>
      <button type='button' className='btn' onClick={() => setIsOpen(true)}>Track</button>
      
      <AnimatePresence>
        {isOpen && (
          <Dialog static open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30"
            />
            
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
              <Dialog.Panel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-lg space-y-4 bg-white p-12"
              >
                <Image 
                  src='/assets/icons/x-close.svg'
                  alt='close'
                  width={28}
                  height={28}
                  onClick={() => setIsOpen(false)}
                  className='cursor-pointer ml-auto'
                />

                <Dialog.Title className="text-lg font-bold">Stay uptodate with product pricing alerts right in your inbox!</Dialog.Title>
                <Dialog.Description>Never miss a bargain again with our timely alerts!</Dialog.Description>

                <form action="" className='flex flex-col mt-5' onSubmit={handleSubmit}>
                  <label htmlFor="email" className='text-sm font-medium text-gray-700'>Email Address</label>
                  <div className='dialog-input_container'>
                    <Image
                      src='/assets/icons/mail.svg' 
                      alt='mail'
                      width={18}
                      height={18}
                    />
                    <input 
                      type="text" 
                      required 
                      id='email' 
                      placeholder='Enter your email address' 
                      className='dialog-input'  
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}  
                    />
                  </div>
                  <button className='dialog-btn' type='submit'>
                    {isSubmitting ? 'Submitting....' : "Track"}
                  </button>
                </form>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}

export default Modal
