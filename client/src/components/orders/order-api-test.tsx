'use client';

import { FormEvent, useState } from 'react';

import { useCreateOrder } from '@/hooks/orders/use-create-order';

export default function OrderApiTest() {
  const createOrder = useCreateOrder();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    createOrder.mutate({
      shippingAddress: {
        fullName,
        phone,
        address,
        city,
        state,
      },
      notes: notes || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Checkout
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Full Name
          </label>

          <input
            value={fullName}
            onChange={(event) =>
              setFullName(event.target.value)
            }
            className="w-full rounded-md border px-3 py-2"
            placeholder="Full name"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Phone
          </label>

          <input
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            className="w-full rounded-md border px-3 py-2"
            placeholder="Phone number"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Address
          </label>

          <textarea
            value={address}
            onChange={(event) =>
              setAddress(event.target.value)
            }
            className="w-full rounded-md border px-3 py-2"
            placeholder="Delivery address"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            City
          </label>

          <input
            value={city}
            onChange={(event) =>
              setCity(event.target.value)
            }
            className="w-full rounded-md border px-3 py-2"
            placeholder="City"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            State
          </label>

          <input
            value={state}
            onChange={(event) =>
              setState(event.target.value)
            }
            className="w-full rounded-md border px-3 py-2"
            placeholder="State"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Notes
          </label>

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            className="w-full rounded-md border px-3 py-2"
            placeholder="Optional delivery notes"
          />
        </div>

        <button
          type="submit"
          disabled={createOrder.isPending}
          className="w-full rounded-md bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {createOrder.isPending
            ? 'Creating Order...'
            : 'Create Order'}
        </button>
      </form>

      {createOrder.isSuccess && (
        <div className="mt-6 rounded-md border p-4">
          <h2 className="font-semibold">
            Order created successfully
          </h2>

          <p className="mt-2">
            Order Number:{' '}
            {createOrder.data.data.orderNumber}
          </p>

          <p>
            Total: ₦
            {createOrder.data.data.total}
          </p>

          <p>
            Status:{' '}
            {createOrder.data.data.status}
          </p>
        </div>
      )}

      {createOrder.isError && (
        <div className="mt-6 rounded-md border p-4 text-red-600">
          <p>
            Failed to create order.
          </p>

          <p className="mt-1 text-sm">
            {createOrder.error instanceof Error
              ? createOrder.error.message
              : 'Something went wrong'}
          </p>
        </div>
      )}
    </div>
  );
}