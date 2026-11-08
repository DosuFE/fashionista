
'use client';

import { useState } from 'react';
import { LoaderCircle, LockKeyhole } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useInitializePayment } from '@/hooks/payments/useInitializePayment';

interface PayNowButtonProps {
  orderId: string;
  disabled?: boolean;
}

export function PayNowButton({
  orderId,
  disabled = false,
}: PayNowButtonProps) {
  const initializePayment = useInitializePayment();
  const [errorMessage, setErrorMessage] = useState('');

  async function handlePayNow() {
    setErrorMessage('');

    try {
      const result = await initializePayment.mutateAsync(orderId);

      if (!result.authorizationUrl) {
        throw new Error('The checkout URL was not returned.');
      }

      // Redirect the customer to Paystack's hosted checkout.
      window.location.assign(result.authorizationUrl);
    } catch {
      setErrorMessage(
        'We could not start your payment. Please try again.',
      );
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className="w-full"
        disabled={disabled || initializePayment.isPending}
        onClick={handlePayNow}
      >
        {initializePayment.isPending ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Preparing payment...
          </>
        ) : (
          <>
            <LockKeyhole className="mr-2 h-4 w-4" />
            Pay now
          </>
        )}
      </Button>

      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
