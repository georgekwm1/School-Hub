from django.shortcuts import render

def main_home_view(request):
    ''' added a view for home page so it doesn't show the default django design'''

    return render(request, 'index.html')
