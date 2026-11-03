from rest_framework.decorators import (
    api_view,
    parser_classes,
    authentication_classes,
    permission_classes,
)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token

from django.contrib.auth import authenticate
from django.db.models import F

# ✅ Added Testimonial to models import
from .models import Blog, CallbackRequest, Course, Gallery, ContactMessage, PlacementStudent, TeamMember, Technology, Testimonial
from .serializers import (
    BlogSerializer,
    CallbackRequestSerializer, 
    GallerySerializer, 
    ContactMessageSerializer,
    PlacementStudentSerializer,
    TeamMemberSerializer,
    CourseSerializer,
    TechnologySerializer,
    TestimonialSerializer, # ✅ Added TestimonialSerializer import
)


# ---------------------------------------------------------------------------
# Admin login
# ---------------------------------------------------------------------------
@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")

    if not username or not password:
        return Response(
            {"detail": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request=request, username=username, password=password)

    if user is None or not user.is_active or not user.is_superuser:
        return Response(
            {"detail": "Invalid credentials or insufficient permissions."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "token": token.key,
            "username": user.username,
            "is_superuser": user.is_superuser,
        }
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _is_admin(request):
    """Return True if the request carries a valid token for an active user."""
    return bool(request.user and request.user.is_authenticated)


# ---------------------------------------------------------------------------
# Blog list:  GET public  |  POST admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def blog_list(request):
    if request.method == "GET":
        blogs = Blog.objects.all()
        serializer = BlogSerializer(blogs, many=True, context={"request": request})
        return Response(serializer.data)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = BlogSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Blog detail:  GET public (increments views)  |  PUT/PATCH/DELETE admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def blog_detail(request, pk):
    try:
        blog = Blog.objects.get(pk=pk)
    except Blog.DoesNotExist:
        return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        Blog.objects.filter(pk=pk).update(views=F("views") + 1)
        blog.refresh_from_db(fields=["views"])
        serializer = BlogSerializer(blog, context={"request": request})
        return Response(serializer.data)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method in ["PUT", "PATCH"]:
        serializer = BlogSerializer(
            blog,
            data=request.data,
            partial=(request.method == "PATCH"),
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    blog.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)



# ---------------------------------------------------------------------------
# Blog detail using slug: Public GET
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([AllowAny])
def blog_detail_by_slug(request, slug):
    try:
        blog = Blog.objects.get(slug=slug)

    except Blog.DoesNotExist:
        return Response(
            {"error": "Blog not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    Blog.objects.filter(pk=blog.pk).update(
        views=F("views") + 1
    )

    blog.refresh_from_db(fields=["views"])

    serializer = BlogSerializer(
        blog,
        context={"request": request}
    )

    return Response(serializer.data)


# ---------------------------------------------------------------------------
# Gallery list:  GET public  |  POST admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def gallery_list(request):
    if request.method == "GET":
        items = Gallery.objects.all()
        serializer = GallerySerializer(items, many=True, context={"request": request})
        return Response(serializer.data)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = GallerySerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Gallery detail:  GET public  |  PUT/PATCH/DELETE admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def gallery_detail(request, pk):
    try:
        item = Gallery.objects.get(pk=pk)
    except Gallery.DoesNotExist:
        return Response({"error": "Gallery image not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = GallerySerializer(item, context={"request": request})
        return Response(serializer.data)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method in ["PUT", "PATCH"]:
        serializer = GallerySerializer(
            item,
            data=request.data,
            partial=(request.method == "PATCH"),
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    item.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Contact list:  POST public  |  GET admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def contact_list(request):
    if request.method == "POST":
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Message sent successfully."}, status=status.HTTP_201_CREATED)
        
        print("CONTACT FORM ERRORS:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    
    messages = ContactMessage.objects.all()
    serializer = ContactMessageSerializer(messages, many=True)
    return Response(serializer.data)


# ---------------------------------------------------------------------------
# Contact detail:  DELETE / PATCH admin-only
# ---------------------------------------------------------------------------
@api_view(["DELETE", "PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def contact_detail(request, pk):
    try:
        msg = ContactMessage.objects.get(pk=pk)
    except ContactMessage.DoesNotExist:
        return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "PATCH":
        msg.is_read = request.data.get("is_read", msg.is_read)
        msg.save()
        return Response({"status": "updated"})

    msg.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Placements: GET public | POST admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def placement_list(request):
    if request.method == "GET":
        students = PlacementStudent.objects.all()
        serializer = PlacementStudentSerializer(students, many=True, context={"request": request})
        return Response(serializer.data)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = PlacementStudentSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Placement detail: PUT/PATCH/DELETE admin-only
# ---------------------------------------------------------------------------
@api_view(["PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def placement_detail(request, pk):
    try:
        student = PlacementStudent.objects.get(pk=pk)
    except PlacementStudent.DoesNotExist:
        return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method in ["PUT", "PATCH"]:
        serializer = PlacementStudentSerializer(
            student,
            data=request.data,
            partial=(request.method == "PATCH"),
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    student.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Team Members: GET public | POST admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def team_list(request):
    if request.method == "GET":
        members = TeamMember.objects.all()
        serializer = TeamMemberSerializer(members, many=True, context={"request": request})
        return Response(serializer.data)

    # POST (Create new member) - Admin only
    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = TeamMemberSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # If it fails, print to terminal to debug
    print("TEAM ADD FAILED. ERRORS:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Team Member detail: PUT/PATCH/DELETE admin-only
# ---------------------------------------------------------------------------
@api_view(["PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def team_detail(request, pk):
    try:
        member = TeamMember.objects.get(pk=pk)
    except TeamMember.DoesNotExist:
        return Response({"error": "Team member not found"}, status=status.HTTP_404_NOT_FOUND)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method in ["PUT", "PATCH"]:
        serializer = TeamMemberSerializer(
            member,
            data=request.data,
            partial=(request.method == "PATCH"),
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    member.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)



# ---------------------------------------------------------------------------
# Courses: GET public | POST admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def course_list(request):
    if request.method == "GET":
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True, context={"request": request})
        return Response(serializer.data)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = CourseSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    print("COURSE ADD FAILED:", serializer.errors) # Helpful for debugging
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Course detail: PUT/PATCH/DELETE admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def course_detail(request, pk):
    try:
        course = Course.objects.get(pk=pk)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = CourseSerializer(course, context={"request": request})
        return Response(serializer.data)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method in ["PUT", "PATCH"]:
        serializer = CourseSerializer(
            course, 
            data=request.data, 
            partial=(request.method == "PATCH"), 
            context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    course.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Course detail using slug - Public GET
# ---------------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def course_detail_by_slug(request, slug):
    try:
        course = Course.objects.get(slug=slug)
    except Course.DoesNotExist:
        return Response(
            {"error": "Course not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = CourseSerializer(
        course,
        context={"request": request}
    )

    return Response(serializer.data)

# ---------------------------------------------------------------------------
# Technologies: GET public | POST admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def technology_list(request):
    if request.method == "GET":
        technologies = Technology.objects.all()
        serializer = TechnologySerializer(technologies, many=True, context={"request": request})
        return Response(serializer.data)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = TechnologySerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Technology detail: PUT/PATCH/DELETE admin-only
# ---------------------------------------------------------------------------
@api_view(["PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def technology_detail(request, pk):
    try:
        tech = Technology.objects.get(pk=pk)
    except Technology.DoesNotExist:
        return Response({"error": "Technology not found"}, status=status.HTTP_404_NOT_FOUND)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method in ["PUT", "PATCH"]:
        serializer = TechnologySerializer(
            tech, 
            data=request.data, 
            partial=(request.method == "PATCH"), 
            context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    tech.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Testimonials: GET public | POST admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def testimonial_list(request):
    if request.method == "GET":
        testimonials = Testimonial.objects.all()
        serializer = TestimonialSerializer(testimonials, many=True, context={"request": request})
        return Response(serializer.data)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = TestimonialSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Testimonial detail: PUT/PATCH/DELETE admin-only
# ---------------------------------------------------------------------------
@api_view(["PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def testimonial_detail(request, pk):
    try:
        testimonial = Testimonial.objects.get(pk=pk)
    except Testimonial.DoesNotExist:
        return Response({"error": "Testimonial not found"}, status=status.HTTP_404_NOT_FOUND)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method in ["PUT", "PATCH"]:
        serializer = TestimonialSerializer(
            testimonial, 
            data=request.data, 
            partial=(request.method == "PATCH"), 
            context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    testimonial.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)




from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny
from .models import HireEnquiry
from .serializers import HireEnquirySerializer

# ---------------------------------------------------------------------------
# Hire Enquiries: POST public | GET admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def hire_enquiry_list(request):
    if request.method == "POST":
        serializer = HireEnquirySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Enquiry submitted successfully."}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    
    enquiries = HireEnquiry.objects.all()
    serializer = HireEnquirySerializer(enquiries, many=True)
    return Response(serializer.data)


# ---------------------------------------------------------------------------
# Hire Enquiry detail: DELETE / PATCH admin-only
# ---------------------------------------------------------------------------
@api_view(["DELETE", "PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def hire_enquiry_detail(request, pk):
    try:
        enquiry = HireEnquiry.objects.get(pk=pk)
    except HireEnquiry.DoesNotExist:
        return Response({"error": "Enquiry not found"}, status=status.HTTP_404_NOT_FOUND)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "PATCH":
        enquiry.is_read = request.data.get("is_read", enquiry.is_read)
        enquiry.save()
        return Response({"status": "updated"})

    enquiry.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)





import uuid
from datetime import datetime
from rest_framework.decorators import api_view, parser_classes, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny
from .models import Career
from .serializers import CareerSerializer

# ---------------------------------------------------------------------------
# Careers List: GET public | POST admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def career_list(request):
    if request.method == "GET":
        careers = Career.objects.all()
        serializer = CareerSerializer(careers, many=True)
        return Response(serializer.data)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = CareerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------------------------------------------------------------------------
# Career Detail: PUT/PATCH/DELETE admin-only
# ---------------------------------------------------------------------------
@api_view(["PUT", "PATCH", "DELETE"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def career_detail(request, pk):
    try:
        career = Career.objects.get(pk=pk)
    except Career.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method in ["PUT", "PATCH"]:
        serializer = CareerSerializer(career, data=request.data, partial=(request.method == "PATCH"))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    career.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# ---------------------------------------------------------------------------
# Apply for Job: POST public
# ---------------------------------------------------------------------------
@api_view(["POST"])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@authentication_classes([])
@permission_classes([AllowAny])
def apply_for_job(request, pk):
    try:
        career = Career.objects.get(pk=pk)
    except Career.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    application_data = {
        "id": str(uuid.uuid4()),
        "name": request.data.get("name"),
        "email": request.data.get("email"),
        "address": request.data.get("address"),
        "contact_number": request.data.get("contact_number"),
        "experience": request.data.get("experience"),
        "qualification": request.data.get("qualification"),
        "applied_at": datetime.now().isoformat(),
        "resume_url": None
    }

    if "resume" in request.FILES:
        resume_file = request.FILES["resume"]
        from django.core.files.storage import default_storage
        from django.conf import settings
        
        file_name = f"resumes/{uuid.uuid4()}_{resume_file.name}"
        saved_path = default_storage.save(file_name, resume_file)
        application_data["resume_url"] = f"{settings.MEDIA_URL}{saved_path}"

    current_apps = career.applications or []
    current_apps.append(application_data)
    career.applications = current_apps
    career.save()

    return Response({"message": "Application submitted successfully."}, status=status.HTTP_201_CREATED)






# ---------------------------------------------------------------------------
# Callback Requests: POST public | GET admin-only
# ---------------------------------------------------------------------------
@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def callback_list(request):
    if request.method == "POST":
        serializer = CallbackRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Callback request submitted successfully."}, status=status.HTTP_201_CREATED)
        
        # Helpful for debugging frontend validation errors
        print("CALLBACK FORM ERRORS:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    
    callbacks = CallbackRequest.objects.all()
    serializer = CallbackRequestSerializer(callbacks, many=True)
    return Response(serializer.data)


# ---------------------------------------------------------------------------
# Callback Request detail: DELETE / PATCH admin-only
# ---------------------------------------------------------------------------
@api_view(["DELETE", "PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def callback_detail(request, pk):
    try:
        callback = CallbackRequest.objects.get(pk=pk)
    except CallbackRequest.DoesNotExist:
        return Response({"error": "Callback request not found"}, status=status.HTTP_404_NOT_FOUND)

    if not _is_admin(request):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "PATCH":
        callback.is_read = request.data.get("is_read", callback.is_read)
        callback.save()
        return Response({"status": "updated"})

    callback.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)






from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token


# ---------------------------------------------------------
# Change Admin Password
# POST: /api/change-password/
# ---------------------------------------------------------

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def change_password(request):

    user = request.user

    # Only superusers can change the admin password
    if not user.is_superuser:
        return Response(
            {"detail": "Only administrators can change the password."},
            status=status.HTTP_403_FORBIDDEN
        )

    current_password = request.data.get("current_password", "")
    new_password = request.data.get("new_password", "")

    # Check required fields
    if not current_password or not new_password:
        return Response(
            {
                "detail": "Current password and new password are required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify current password
    if not user.check_password(current_password):
        return Response(
            {"detail": "Your current password is incorrect."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Prevent using the same password
    if current_password == new_password:
        return Response(
            {
                "detail": "New password must be different from current password."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Save password without Django password validators
    user.set_password(new_password)
    user.save()

    # Delete old token
    Token.objects.filter(user=user).delete()

    # Generate new token
    new_token = Token.objects.create(user=user)

    return Response(
        {
            "message": "Password changed successfully.",
            "token": new_token.key
        },
        status=status.HTTP_200_OK
    )
