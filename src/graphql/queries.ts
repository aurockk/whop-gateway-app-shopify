export const DRAFT_ORDER_CREATE = `
mutation draftOrderCreate($input: DraftOrderInput!){
    draftOrderCreate(input: $input){
        draftOrder { id }
        userErrors{ field message }
    }
}`

export const DRAFT_ORDER_COMPLETE = `
mutation draftOrderComplete($id: ID!, $paymentPending: Boolean) {
    draftOrderComplete(id: $id, paymentPending: $paymentPending) {
        order { id name statusUrl }
        userErrors { field message }
    }    
}
`